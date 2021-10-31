import * as orm from "typeorm";
import safe from "safe-typeorm";
import { HashMap } from "tstl/container/HashMap";
import { HashSet } from "tstl/container/HashSet";
import { VariadicSingleton } from "tstl/thread/VariadicSingleton";
import { hash } from "tstl/functional/hash";
import { equal } from "tstl/ranges/algorithm/iterations";

import { Configuration } from "../Configuration";
import { IEntity } from "../api/structures/common/IEntity";

export namespace EntityUnifier
{
    /* -----------------------------------------------------------
        UNIFIER
    ----------------------------------------------------------- */
    /**
     * 중복된 레코드들을 하나로 통합한다.
     * 
     * 복수의 `Entity` 레코드들을, 하나의 레코드로 흡수-병합한다. 즉, *duplicates* 에 기입된 모든 
     * 레코드들을 삭제하고, 그 대신 중복 레코드들에 종속되어있는 모든 레코드의 *Entity* 에 대한 참조 
     * 내역을, 모두 *original* 의 것으로 교체해준다.
     * 
     * @template Entity 타깃 엔티티의 클래스 타입.
     * @param original 원본 레코드, 중복 레코드가 모두 이리로 통합된다.
     * @param duplicates 중복 레코드 리스트, 모두 원본으로 통합된다.
     */
    export async function unify<Entity extends safe.Model>
        (
            original: Entity, 
            duplicates: Entity[]
        ): Promise<void>
    {
        const info: ITableInfo = await getTableInfo(original.constructor as safe.Model.Creator<Entity>);
        const deprecates: string[] = duplicates.map(elem => (elem as any)[info.primaryColumn]);

        await _Unify(info, (original as any)[info.primaryColumn], deprecates);
    }

    async function _Unify
        (
            table: ITableInfo, 
            keep: string, 
            deprecates: string[]
        ): Promise<void>
    {
        if (deprecates.length === 0)
            return;

        for (const dependency of table.children)
        {
            let standalone: boolean = true;
            if (dependency.unique.length !== 0)
                for (const columns of dependency.unique)
                    if (columns.find(col => col === dependency.foreignColumn) !== undefined)
                    {
                        standalone = false;
                        await _Unify_unique_children(keep, deprecates, dependency, columns);
                    }
            if (standalone === true)
            {
                // UPDATE RECORD DIRECTLY
                await safe.findRepository(dependency.table.target)
                    .createQueryBuilder()
                    .andWhere(`${dependency.foreignColumn} IN (:deprecates)`, { deprecates })
                    .update({ [dependency.foreignColumn]: keep })
                    .updateEntity(false)
                    .execute();
            }
        }
        
        // DELETE THE DUPLICATED RECORDS
        await safe.findRepository(table.target)
            .createQueryBuilder()
            .andWhere(`${table.primaryColumn} IN (:deprecates)`, { deprecates })
            .delete()
            .execute();
    }

    async function _Unify_unique_children
        (
            keep: string, 
            deprecates: string[],
            child: ITableInfo.IChild,
            columns: string[]
        ): Promise<void>
    {
        const group: string[] = columns.filter(col => col !== child.foreignColumn);
        if (group.length !== 0)
            await safe.findRepository(child.table.target).query
            (
                `UPDATE ${child.table.name}
                SET ${child.foreignColumn} = ?
                WHERE ${child.table.primaryColumn} IN
                (
                    SELECT MIN(${child.table.primaryColumn}) AS ${child.table.primaryColumn}
                    FROM ${child.table.name}
                    WHERE ${child.foreignColumn} IN (?)
                    GROUP BY ${group.join(", ")}
                    HAVING COUNT(IF(${child.foreignColumn} = ?, 1, NULL)) = 0
                )`,
                [keep, [keep, ...deprecates], keep]
            );

        const recordList: (IEntity & any)[] =  await safe.findRepository(child.table.target).query
        (
            `SELECT * 
            FROM ${child.table.name} 
            WHERE ${child.foreignColumn} IN (?)
            ORDER BY ${child.table.primaryColumn} ASC`, 
            [ [keep, ...deprecates] ]
        );

        const dict: HashMap<any[], (IEntity & any)[]> = new HashMap(elements => hash(...elements), (x, y) => equal(x, y));
        for (const record of recordList)
        {
            const key: any[] = group.map(col => record[col]);
            let it: HashMap.Iterator<any[], (IEntity & any)[]> = dict.find(key);
            if (it.equals(dict.end()) === true)
                it = dict.emplace(key, []).first;
            it.second.push(record);
        }

        for (const it of dict)
        {
            const index: number = it.second.findIndex(rec => rec[child.foreignColumn] === keep);
            const master: any = it.second[index];
            const slaves: any[] = it.second.filter((_, i) => i !== index);

            await _Unify(child.table, master[child.table.primaryColumn], slaves.map(s => s[child.table.primaryColumn]));
        }
    }

    /* -----------------------------------------------------------
        UTILITY FUNCTIONS
    ----------------------------------------------------------- */
    export interface ITableInfo
    {
        target: safe.typings.Creator<object>,
        name: string;
        primaryColumn: string;
        children: ITableInfo.IChild[];
    }
    export namespace ITableInfo
    {
        export interface IChild
        {
            table: ITableInfo;
            foreignColumn: string;
            unique: string[][];
        }
    }

    export function getTable<Entity extends safe.Model>
        (entity: safe.Model.Creator<Entity>): string
    {
        return entity.getRepository().metadata.tableName;
    }

    export async function getTableInfo<Entity extends safe.Model>
        (entity: safe.Model.Creator<Entity>): Promise<ITableInfo>
    {
        const table: string = getTable(entity);
        const dict: HashMap<string, ITableInfo> = await table_infos_.get(entity.getRepository().manager.connection);

        return dict.get(table);
    }

    const table_infos_ = new VariadicSingleton(async (connection: orm.Connection) =>
    {
        interface IUniqueContraint
        {
            constraint_name: string;
            table_name: string;
            column_name: string;
        }

        const constraints: IUniqueContraint[] = await connection.query
        (
            `SELECT DISTINCT 
                TCO.table_name, 
                STAT.column_name
            FROM information_schema.table_constraints AS TCO
                INNER JOIN information_schema.statistics AS STAT
                    ON TCO.table_schema = STAT.table_schema AND
                        TCO.table_name = STAT.table_name AND
                        TCO.constraint_name = STAT.index_name
            WHERE TCO.table_schema = ? AND 
                TCO.constraint_type = 'UNIQUE'`,
            [ Configuration.DB_CONFIG.database ]
        );
        const uniqueDict: HashMap<string, HashMap<string, HashSet<string>>> = new HashMap();
        for (const restrict of constraints)
        {
            let tit = uniqueDict.find(restrict.table_name);
            if (tit.equals(uniqueDict.end()) === true)
                tit = uniqueDict.emplace(restrict.table_name, new HashMap()).first;

            let cit = tit.second.find(restrict.constraint_name);
            if (cit.equals(tit.second.end()) === true)
                cit = tit.second.emplace(restrict.constraint_name, new HashSet()).first;

            cit.second.insert(restrict.column_name);
        }

        const output: HashMap<string, ITableInfo> = new HashMap();
        const entities: orm.EntityMetadata[] = connection.entityMetadatas;

        for (const entity of entities)
        {
            const name: string = entity.tableName;
            const primaryColumn: string = entity.primaryColumns[0].databaseName;

            output.emplace(name, {
                name,
                target: entity.target as safe.typings.Creator<object>,
                primaryColumn,
                children: []
            });
        }

        for (const entity of entities)
        {
            const table: ITableInfo = output.get(entity.tableName);
            for (const foreign of entity.foreignKeys)
            {
                const parent: ITableInfo = output.get(foreign.referencedEntityMetadata.tableName);
                const foreignColumn: string = foreign.columns[0].databaseName;
                const unique: string[][] = [];

                if (uniqueDict.has(table.name))
                    for (const tit of uniqueDict.get(table.name))
                        if (tit.second.has(foreignColumn))
                            unique.push(tit.second.toJSON());

                parent.children.push({
                    table,
                    foreignColumn,
                    unique
                });
            }
        }
        return output;
    });
}