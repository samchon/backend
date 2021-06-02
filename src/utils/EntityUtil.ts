import * as orm from "typeorm";
import safe from "safe-typeorm";
import { HashMap } from "tstl/container/HashMap";
import { HashSet } from "tstl/container/HashSet";
import { Singleton } from "tstl/thread/Singleton";
import { hash } from "tstl/functional/hash";
import { equal } from "tstl/ranges/algorithm/iterations";

import { Configuration } from "../Configuration";
import { IEntity } from "../api/structures/common/IEntity";

export namespace EntityUtil
{
    /* -----------------------------------------------------------
        UNIFIER
    ----------------------------------------------------------- */
    export interface IUnifierEntity<Entity extends IUnifierEntity<Entity>> 
        extends safe.Model
    {
        readonly id: string;
    }

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
    export async function unify<Entity extends IUnifierEntity<Entity>>
        (
            original: Entity, 
            duplicates: Entity[]
        ): Promise<void>
    {
        const table: string = getTable(original.constructor as safe.Model.Creator<Entity>);
        const deprecates: string[] = duplicates.map(elem => elem.id);

        await safe.Transaction.run(manager => _Unify(manager, table, original.id, deprecates));
    }

    async function _Unify
        (
            manager: orm.EntityManager, 
            table: string, 
            id: string, 
            deprecates: string[]
        ): Promise<void>
    {
        if (deprecates.length === 0)
            return;

        const dict: HashMap<string, IDependency[]> = await dependencies_.get();
        const it: HashMap.Iterator<string, IDependency[]> = dict.find(table);
        if (it.equals(dict.end()) === true)
            return;

        for (const info of it.second)
        {
            let standalone: boolean = true;
            if (info.unique.length !== 0)
                for (const columns of info.unique)
                    if (columns.find(col => col === info.column) !== undefined)
                    {
                        standalone = false;
                        await _Unify_unique_children(manager, id, deprecates, info, columns);
                    }
            if (standalone === true)
            {
                // UPDATE RECORD DIRECTLY
                await manager.getRepository(info.table)
                    .createQueryBuilder()
                    .andWhere(`${info.column} IN (:deprecates)`, { deprecates })
                    .update({ [info.column]: id })
                    .updateEntity(false)
                    .execute();
            }
        }
        
        // DELETE THE DUPLICATED RECORDS
        await manager.getRepository(table)
            .createQueryBuilder()
            .andWhere("id IN (:deprecates)", { deprecates })
            .delete()
            .execute();
    }

    async function _Unify_unique_children
        (
            manager: orm.EntityManager, 
            id: string, 
            deprecates: string[],
            info: IDependency,
            columns: string[]
        ): Promise<void>
    {
        const group: string[] = columns.filter(col => col !== info.column);
        await manager.query
        (
            `UPDATE ${info.table}
            SET ${info.column} = ?
            WHERE id IN
            (
                SELECT MIN(id) AS id
                FROM ${info.table}
                WHERE ${info.column} IN (?)
                GROUP BY ${group.join(", ")}
                HAVING COUNT(IF(${info.column} = ?, 1, NULL)) = 0
            )`,
            [id, [id, ...deprecates], id]
        );
        
        const recordList: (IEntity & any)[] = await manager.query
        (
            `SELECT * 
            FROM ${info.table} 
            WHERE ${info.column} IN (?)
            ORDER BY id ASC`, 
            [ [id, ...deprecates] ]
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
            const index: number = it.second.findIndex(rec => rec[info.column] === id);
            const master: (IEntity & any) = it.second[index];
            const slaves: (IEntity & any)[] = it.second.filter((_, i) => i !== index);

            await _Unify(manager, info.table, master.id, slaves.map(s => s.id));
        }
    }

    /* -----------------------------------------------------------
        UTILITY FUNCTIONS
    ----------------------------------------------------------- */
    export interface IDependency
    {
        table: string;
        column: string;
        unique: string[][];
    }

    export function getTable<Entity extends safe.Model>
        (entity: safe.Model.Creator<Entity>): string
    {
        return entity.getRepository().metadata.tableName;
    }

    export async function getDependencies<Entity extends safe.Model>
        (entity: safe.Model.Creator<Entity>): Promise<IDependency[]>
    {
        const table: string = getTable(entity);
        const dict: HashMap<string, IDependency[]> = await dependencies_.get();

        return dict.get(table);
    }

    const dependencies_: Singleton<HashMap<string, IDependency[]>> = new Singleton(async () =>
    {
        interface IUniqueContraint
        {
            constraint_name: string;
            table_name: string;
            column_name: string;
        }

        const constraints: IUniqueContraint[] = await orm.getConnection().query
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

        const foreignDict: HashMap<string, IDependency[]> = new HashMap();
        for (const entity of orm.getConnection().entityMetadatas)
            for (const foreign of entity.foreignKeys)
            {
                const key: string = foreign.referencedEntityMetadata.tableName;
                let fit: HashMap.Iterator<string, IDependency[]> = foreignDict.find(key);
                if (fit.equals(foreignDict.end()) === true)
                    fit = foreignDict.emplace(key, []).first;

                const table: string = entity.tableName;
                const column: string = foreign.columns[0].databaseName;
                const unique: string[][] = [];

                if (uniqueDict.has(table))
                    for (const tit of uniqueDict.get(table))
                        if (tit.second.has(column))
                            unique.push(tit.second.toJSON());

                fit.second.push({
                    table,
                    column,
                    unique
                });
            }
        return foreignDict;
    });
}