import * as orm from "typeorm";
import safe from "safe-typeorm";
import { HashMap } from "tstl/container/HashMap";
import { HashSet } from "tstl/container/HashSet";
import { Singleton } from "tstl/thread/Singleton";
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
     * Unify duplicated records into one.
     * 
     * Absorb duplicated records into one. Another word, remove all of the *duplicates* records and
     * keep only the *keep* record. 
     * 
     * Don't worry about cascade deletion. Depdents records belonged to the *absorbed*, all of 
     * them would be automatically belonged to the *keep*. Even some of the dependent entities 
     * who have the unique constraint would be safely unitifed.
     * 
     * @template Entity Target of the entity type
     * @param keep Original record that would absorb the *absorbed*
     * @param absorbed Duplicated records to be absorbed to the *keep*
     */
    export async function unify<Entity extends IEntity>
        (
            keep: Entity, 
            absorbed: Entity[]
        ): Promise<void>
    {
        const table: string = getTable(keep.constructor as any);
        const deprecates: string[] = absorbed.map(elem => elem.id);

        await safe.Transaction.run(manager => _Unify(manager, table, keep.id, deprecates));
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
    interface IDependency
    {
        table: string;
        column: string;
        unique: string[][];
    }

    function getTable<Entity extends IEntity>
        (entity: safe.typings.Creator<Entity>): string
    {
        return orm.getConnection().getRepository(entity).metadata.tableName;
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