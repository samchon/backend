import { Prisma, PrismaClient } from "@prisma/client";
import { HashMap, hash, ranges } from "tstl";
import typia from "typia";

/**
 * Utility for database entity.
 *
 * @author Samchon
 */
export namespace EntityUtil {
  /**
   * Properties of {@link merge} function.
   */
  export interface IMergeProps<Key extends bigint | number | string> {
    /**
     * Target record to keep after merging.
     *
     * After merge process, {@link absorbed} records would be merged into
     * this {@link keep} record.
     */
    keep: Key;

    /**
     * To be merged to {@link keep} after merging.
     */
    absorbed: Key[];
  }

  /**
   * Merge multiple records into one.
   *
   * Merge multiple {@link IMergeProps.absorbed} records into
   * {@link IMergeProps.keep} record, instead of deleting them.
   *
   * If there're some dependent tables of the target `table` having
   * unique constraint on foriegn key column, such dependent tables
   * also perform the merge process, too.
   *
   * Of course, if there're another dependent tables under those
   * dependents, they also perform the merge process recursively as well.
   * Such recursive merge process still works for self-recursive
   * (tree-structured) tables.
   *
   * @param client Prisma Client
   * @param table Target table to perform merge
   * @param props Target records to merge
   */
  export const merge =
    (client: PrismaClient) =>
    <Table extends Prisma.ModelName>(table: Table) =>
    async <Key extends bigint | number | string>(
      props: IMergeProps<Key>,
    ): Promise<void> => {
      // FIND TARGET MODEL AND PRIMARY KEY
      const model: Prisma.DMMF.Model | undefined =
        Prisma.dmmf.datamodel.models.find((model) => model.name === table);
      if (model === undefined)
        throw new Error(
          `Error on EntityUtil.unify(): table ${table} does not exist.`,
        );
      const key: Prisma.DMMF.Field | undefined = model.fields.find(
        (field) => field.isId === true,
      );
      if (key === undefined)
        throw new Error(
          `Error on EntityUtil.unify(): table ${table} does not have single columned primary key.`,
        );

      // LIST UP DEPENDENCIES
      const dependencies: Prisma.DMMF.Field[] = model.fields.filter(
        (field) =>
          field.kind === "object" &&
          typia.is<Prisma.ModelName>(field.type) &&
          !field.relationFromFields?.length,
      );
      for (const dep of dependencies) {
        // GET TARGET TABLE MODEL AND FOREIGN COLUMN
        const target: Prisma.DMMF.Model = Prisma.dmmf.datamodel.models.find(
          (model) => model.name === dep.type,
        )!;
        const relation: Prisma.DMMF.Field = target.fields.find(
          (field) => field.relationName === dep.relationName,
        )!;
        if (relation.relationFromFields?.length !== 1)
          throw new Error(
            `Error on EntityUtil.unify(): table ${getName(
              target,
            )} has multiple columned foreign key.`,
          );
        const foreign: Prisma.DMMF.Field = target.fields.find(
          (f) => f.name === relation.relationFromFields![0],
        )!;

        // CONSIDER UNIQUE CONSTRAINT -> CASCADE MERGING
        const uniqueMatrix: (readonly string[])[] = target.uniqueFields.filter(
          (columns) => columns.includes(foreign.name),
        );
        if (uniqueMatrix.length)
          for (const unique of uniqueMatrix)
            await _Merge_unique_children(client)({
              table,
              ...props,
            })({
              model: target,
              unique,
              foreign,
            });
        else
          await (client as any)[getName(target)].updateMany({
            where: {
              [foreign.name]: { in: props.absorbed },
            },
            data: {
              [foreign.name]: props.keep,
            },
          });
      }

      // REMOVE TO BE MERGED RECORD
      await (client[table] as any).deleteMany({
        where: {
          [key.name]: { in: props.absorbed },
        },
      });
    };

  const _Merge_unique_children =
    (client: PrismaClient) =>
    (parent: IMergeProps<any> & { table: Prisma.ModelName }) =>
    async (current: {
      model: Prisma.DMMF.Model;
      foreign: Prisma.DMMF.Field;
      unique: readonly string[];
    }) => {
      // GET PRIMARY KEY AND OTHER UNIQUE COLUMNS
      const primary: Prisma.DMMF.Field = current.model.fields.find(
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
      const recordList: any[] = await (client as any)[
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
          await merge(client)(current.model.name as Prisma.ModelName)({
            keep: master[primary.name],
            absorbed: slaves.map((slave) => slave[primary.name]),
          });
      }
    };

  const getName = (x: { dbName?: string | null; name: string }): string =>
    x.dbName ?? x.name;
}
