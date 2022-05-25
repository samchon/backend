import orm from "@modules/typeorm";
import safe from "safe-typeorm";
import { HashMap } from "tstl/container/HashMap";
import { VariadicSingleton } from "tstl/thread/VariadicSingleton";
import { hash } from "tstl/functional/hash";
import { equal } from "tstl/ranges/algorithm/iterations";

import { IEntity } from "@${ORGANIZATION}/${PROJECT}-api/lib/structures/common/IEntity";

export namespace EntityUtil {
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
                UPDATE ${child.info.schema}.${child.info.name}
                SET ${child.foreign} = $1
                WHERE ${child.info.primary} IN
                (
                    SELECT CAST(MIN(CAST(${
                        child.info.primary
                    } AS VARCHAR(36))) AS UUID) AS ${child.info.primary}
                    FROM ${child.info.schema}.${child.info.name}
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
            FROM ${child.info.schema}.${child.info.name} 
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
            const slaves: any[] = it.second.filter((_, i) => i !== index);

            await _Unify(
                child.info,
                master[child.info.primary],
                slaves.map((s) => s[child.info.primary]),
            );
        }
    }

    /* -----------------------------------------------------------
        UTILITY FUNCTIONS
    ----------------------------------------------------------- */
    export interface ITableInfo {
        target: safe.typings.Creator<object>;
        schema: string;
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

    const table_infos_ = new VariadicSingleton((connection: orm.Connection) => {
        const dict: Map<string, ITableInfo> = new Map();
        for (const entity of connection.entityMetadatas) {
            const info: ITableInfo = {
                target: entity.target as safe.typings.Creator<object>,
                schema: entity.schema!,
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
