import orm from "@modules/typeorm";
import safe from "safe-typeorm";
import { HashMap } from "tstl/container/HashMap";
import { hash } from "tstl/functional/hash";
import { equal } from "tstl/ranges/algorithm/iterations";
import { VariadicSingleton } from "tstl/thread/VariadicSingleton";

import { IEntity } from "../api/structures/common/IEntity";

export namespace EntityUtil {
    /* -----------------------------------------------------------
        UNIFIER
    ----------------------------------------------------------- */
    /**
     * Unify records into one.
     *
     * Absorb and merge multiple records into one. That is, delete all *duplicates*
     * records, and replace all reference of *Entity* in all records that depend on
     * *duplicates* with *original*.
     *
     * If there's an unique constraint in dependent records, the dependent records
     * would also be unified. Of course, when grand-children records have such unique
     * constraint too, they would also be unified recursively.
     *
     * @template Entity Type of the target entity
     * @param original Original record, would absorb every duplicated records
     * @param duplicates Duplicated records, would be merged into original
     */
    export async function unify<Entity extends safe.Model>(
        original: Entity,
        duplicates: Entity[],
    ): Promise<void> {
        try {
            const info: ITableInfo = await getTableInfo(
                original.constructor as safe.Model.Creator<Entity>,
            );
            const deprecates: string[] = duplicates.map(
                (elem) => (elem as any)[info.primary],
            );

            await _Unify(info, (original as any)[info.primary], deprecates);
        } catch (exp) {
            console.log(exp);
            process.exit(-1);
        }
    }

    async function _Unify(
        table: ITableInfo,
        keep: string,
        deprecates: string[],
    ): Promise<void> {
        if (deprecates.length === 0) return;

        for (const dependency of table.children) {
            const unique: boolean[] = [];
            if (dependency.info.uniques.length !== 0)
                for (const columns of dependency.info.uniques)
                    if (
                        columns.find((col) => col === dependency.foreign) !==
                        undefined
                    ) {
                        unique.push(false);
                        await _Unify_unique_children(
                            keep,
                            deprecates,
                            dependency,
                            columns,
                        );
                    }
            if (unique.length === 0) {
                // UPDATE RECORD DIRECTLY
                await safe
                    .findRepository(dependency.info.target)
                    .createQueryBuilder()
                    .andWhere(`${dependency.foreign} IN (:...deprecates)`, {
                        deprecates,
                    })
                    .update({ [dependency.foreign]: keep })
                    .updateEntity(false)
                    .execute();
            }
        }

        // DELETE THE DUPLICATED RECORDS
        await safe
            .findRepository(table.target)
            .createQueryBuilder()
            .andWhere(`${table.primary} IN (:...deprecates)`, { deprecates })
            .delete()
            .execute();
    }

    async function _Unify_unique_children(
        keep: string,
        deprecates: string[],
        child: ITableInfo.IChild,
        columns: string[],
    ): Promise<void> {
        const group: string[] = columns.filter((col) => col !== child.foreign);
        if (group.length !== 0) {
            const sql: string = `
                UPDATE ${getTableAlias(child.info)}
                SET ${child.foreign} = $1
                WHERE ${child.info.primary} IN
                (
                    SELECT CAST(MIN(CAST(${
                        child.info.primary
                    } AS VARCHAR(36))) AS UUID) AS ${child.info.primary}
                    FROM ${getTableAlias(child.info)}
                    WHERE ${child.foreign} IN ($1, ${deprecates
                .map((_, index) => `$${index + 2}`)
                .join(", ")})
                    GROUP BY ${group.join(", ")}
                    HAVING COUNT(CASE WHEN ${
                        child.foreign
                    } = $1 THEN 1 ELSE NULL END) = 0
                )`;
            await safe
                .findRepository(child.info.target)
                .query(sql, [keep, ...deprecates]);
        }

        const recordList: (IEntity & any)[] = await safe
            .findRepository(child.info.target)
            .query(
                `SELECT * 
                FROM ${getTableAlias(child.info)} 
                WHERE ${child.foreign} IN (${[keep, ...deprecates]
                    .map((_, index) => `$${index + 1}`)
                    .join(", ")})
                ORDER BY ${child.info.primary} ASC`,
                [keep, ...deprecates],
            );

        const dict: HashMap<any[], (IEntity & any)[]> = new HashMap(
            (elements) => hash(...elements),
            (x, y) => equal(x, y),
        );
        for (const record of recordList) {
            const key: any[] = group.map((col) => record[col]);
            const array: (IEntity & any)[] = dict.take(key, () => []);
            array.push(record);
        }

        for (const it of dict) {
            const index: number = it.second.findIndex(
                (rec) => rec[child.foreign] === keep,
            );
            const master: any = it.second[index];
            if (master === undefined) continue;

            await _Unify(
                child.info,
                master[child.info.primary],
                it.second
                    .filter((_, i) => i !== index, keep)
                    .map((s) => s[child.info.primary]),
            );
        }
    }

    /* -----------------------------------------------------------
        UTILITY FUNCTIONS
    ----------------------------------------------------------- */
    export interface ITableInfo {
        target: safe.typings.Creator<object>;
        schema?: string;
        name: string;
        primary: string;
        uniques: string[][];
        children: ITableInfo.IChild[];
    }
    export namespace ITableInfo {
        export interface IChild {
            info: ITableInfo;
            foreign: string;
        }
    }

    export function getTable<Entity extends safe.Model>(
        entity: safe.Model.Creator<Entity>,
    ): string {
        return entity.getRepository().metadata.tableName;
    }

    export function getTableInfo<Entity extends safe.Model>(
        entity: safe.Model.Creator<Entity>,
    ): ITableInfo {
        const table: string = getTable(entity);
        const dict: Map<string, ITableInfo> = table_infos_.get(
            entity.getRepository().manager.connection,
        );
        return dict.get(table)!;
    }

    function getTableAlias(info: ITableInfo): string {
        return info.schema ? `${info.schema}.${info.name}` : info.name;
    }

    const table_infos_ = new VariadicSingleton((connection: orm.Connection) => {
        const dict: Map<string, ITableInfo> = new Map();
        for (const entity of connection.entityMetadatas) {
            const info: ITableInfo = {
                target: entity.target as safe.typings.Creator<object>,
                schema: entity.schema,
                name: entity.tableName,
                primary: entity.primaryColumns[0].databaseName,
                uniques: entity.uniques.map((u) =>
                    u.columns.map((c) => c.databaseName),
                ),
                children: [],
            };
            dict.set(info.name, info);
        }
        for (const entity of connection.entityMetadatas) {
            const info: ITableInfo = dict.get(entity.tableName)!;
            const parentTuples: [ITableInfo, string][] = entity.foreignKeys.map(
                (fk) => [
                    dict.get(fk.referencedEntityMetadata.tableName)!,
                    fk.columns[0].databaseName,
                ],
            );
            for (const [parent, foreign] of parentTuples)
                parent.children.push({ info, foreign });
        }
        return dict;
    });
}
