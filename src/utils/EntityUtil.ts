import { DMMF } from "@prisma/client/runtime/client";
import {
  MultipleSchemas,
  formatSchema,
  getDMMF,
  mergeSchemas,
} from "@prisma/internals";
import { Prisma } from "@prisma/sdk";
import fs from "fs";
import { HashMap, Singleton, hash, ranges } from "tstl";
import typia from "typia";

import { MyConfiguration } from "../MyConfiguration";
import { MyGlobal } from "../MyGlobal";

export namespace EntityUtil {
  export interface IMergeProps<Key extends bigint | number | string> {
    keep: Key;
    absorbed: Key[];
  }

  export const getMetadata = () => metadata.get();

  /**
   * Merge multiple records into one.
   *
   * Merge multiple {@link IMergeProps.absorbed} records into
   * {@link IMergeProps.keep} record, instead of deleting them.
   *
   * If there're some dependent tables of the target `table` having
   * unique constraint on foreign key column, such dependent tables
   * also perform the merge process, too.
   *
   * Of course, if there're another dependent tables under those
   * dependents, they also perform the merge process recursively as well.
   * Such recursive merge process still works for self-recursive
   * (tree-structured) tables.
   *
   * @param table Target table to perform merge
   * @param props Target records to merge
   */
  export const merge =
    <Table extends Prisma.ModelName>(table: Table) =>
    async <Key extends bigint | number | string>(
      props: IMergeProps<Key>,
    ): Promise<void> => {
      // FIND TARGET MODEL AND PRIMARY KEY
      const dmmf = await getMetadata();
      const model: DMMF.Model | undefined = dmmf.datamodel.models.find(
        (model) => model.name === table,
      );
      if (model === undefined)
        throw new Error(
          `Error on EntityUtil.merge(): table ${table} does not exist.`,
        );
      const key: DMMF.Field | undefined = model.fields.find(
        (field) => field.isId === true,
      );
      if (key === undefined)
        throw new Error(
          `Error on EntityUtil.merge(): table ${table} does not have single columned primary key.`,
        );

      // LIST UP DEPENDENCIES
      const dependencies: DMMF.Field[] = model.fields.filter(
        (field) =>
          field.kind === "object" &&
          typia.is<Prisma.ModelName>(field.type) &&
          !field.relationFromFields?.length,
      );
      for (const dep of dependencies) {
        // GET TARGET TABLE MODEL AND FOREIGN COLUMN
        const target: DMMF.Model = dmmf.datamodel.models.find(
          (model) => model.name === dep.type,
        )!;
        const relation: DMMF.Field = target.fields.find(
          (field) => field.relationName === dep.relationName,
        )!;
        if (relation.relationFromFields?.length !== 1)
          throw new Error(
            `Error on EntityUtil.unify(): table ${getName(
              target,
            )} has multiple columned foreign key.`,
          );

        // CONSIDER UNIQUE CONSTRAINT -> CASCADE MERGING
        const foreign: DMMF.Field = target.fields.find(
          (f) => f.name === relation.relationFromFields![0],
        )!;
        const uniqueMatrix: (readonly string[])[] = target.uniqueFields.filter(
          (columns) => columns.includes(foreign.name),
        );
        if (uniqueMatrix.length)
          for (const unique of uniqueMatrix)
            await _Merge_unique_children({
              table,
              ...props,
            })({
              model: target,
              unique,
              foreign,
            });
        else
          await (MyGlobal.prisma as any)[getName(target)].updateMany({
            where: {
              [foreign.name]: { in: props.absorbed },
            },
            data: {
              [foreign.name]: props.keep,
            },
          });
      }

      // REMOVE TO BE MERGED RECORD
      await (MyGlobal.prisma[table] as any).deleteMany({
        where: {
          [key.name]: { in: props.absorbed },
        },
      });
    };

  const _Merge_unique_children =
    (parent: IMergeProps<any> & { table: Prisma.ModelName }) =>
    async (current: {
      model: DMMF.Model;
      foreign: DMMF.Field;
      unique: readonly string[];
    }) => {
      // GET PRIMARY KEY AND OTHER UNIQUE COLUMNS
      const primary: DMMF.Field = current.model.fields.find(
        (column) => column.isId === true,
      )!;
      const group: string[] = current.unique.filter(
        (column) => column !== current.foreign.name,
      );

      // COMPOSE GROUPS OF OTHER UNIQUE COLUMNS
      const dict: HashMap<any[], any[]> = new HashMap(
        (elements) => hash(...elements.map((e) => JSON.stringify(e))),
        (x, y) =>
          ranges.equal(x, y, (a, b) => JSON.stringify(a) === JSON.stringify(b)),
      );
      const recordList: any[] = await (MyGlobal.prisma as any)[
        current.model.name
      ].findMany({
        where: {
          [current.foreign.name]: {
            in: [parent.keep, ...parent.absorbed],
          },
        },
        orderBy: [
          {
            [primary.name]: "asc",
          },
        ],
      });
      for (const record of recordList) {
        const key: any[] = group.map((column) => record[column]);
        const array: any[] = dict.take(key, () => []);
        array.push(record);
      }

      // MERGE THEM
      for (const it of dict) {
        const index: number = it.second.findIndex(
          (rec) => rec[current.foreign.name] === parent.keep,
        );
        if (index === -1) continue;

        const master: any = it.second[index];
        const slaves: any[] = it.second.filter((_r, i) => i !== index);
        if (slaves.length)
          await merge(current.model.name as Prisma.ModelName)({
            keep: master[primary.name],
            absorbed: slaves.map((slave) => slave[primary.name]),
          });
      }
    };

  const getName = (x: { dbName?: string | null; name: string }): string =>
    x.dbName ?? x.name;
}

const metadata = new Singleton(async () => {
  const multipleSchemas: MultipleSchemas = await formatSchema({
    schemas: await fs.promises
      .readdir(`${MyConfiguration.ROOT}/prisma/schemas`)
      .then(
        async (files) =>
          await Promise.all(
            files.map(
              async (f) =>
                [
                  f,
                  await fs.promises.readFile(
                    `${MyConfiguration.ROOT}/prisma/schemas/${f}`,
                    "utf8",
                  ),
                ] as const,
            ),
          ),
      ),
  });
  return await getDMMF({
    datamodel: mergeSchemas({ schemas: multipleSchemas }),
  });
});
