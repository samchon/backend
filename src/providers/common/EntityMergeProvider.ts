import { Prisma } from "@prisma/client";

import { IRecordMerge } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IRecordMerge";

import { MyGlobal } from "../../MyGlobal";
import { EntityUtil } from "../../utils/EntityUtil";
import { ErrorProvider } from "./ErrorProvider";

export namespace EntityMergeProvider {
  export const merge =
    (
      table: Prisma.ModelName,
      finder?: (input: IRecordMerge) => Promise<number>,
    ) =>
    async (input: IRecordMerge): Promise<void> => {
      // VALIDATE TABLE
      const primary: Prisma.DMMF.Field | undefined =
        Prisma.dmmf.datamodel.models
          .find((model) => model.name === table)
          ?.fields.find((field) => field.isId === true);
      if (primary === undefined) throw ErrorProvider.internal("Invalid table.");

      // FIND MATCHED RECORDS
      const count: number = finder
        ? await finder(input)
        : await (MyGlobal.prisma[table] as any).count({
            where: {
              [primary.name]: {
                in: [input.keep, ...input.absorbed],
              },
            },
          });
      if (count !== input.absorbed.length + 1)
        throw ErrorProvider.notFound({
          accessor: "input.keep | input.absorbed",
          message: "Unable to find matched record.",
        });

      // DO MERGE
      await EntityUtil.merge(MyGlobal.prisma)(table)(input);
    };
}
