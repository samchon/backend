import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IBbsArticle } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IBbsArticle";
import { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IPage";

import { MyGlobal } from "../../MyGlobal";
import { PaginationUtil } from "../../utils/PaginationUtil";
import { AttachmentFileProvider } from "./AttachmentFileProvider";
import { BbsArticleSnapshotProvider } from "./BbsArticleSnapshotProvider";

export namespace BbsArticleProvider {
  export namespace json {
    export const transform = (
      input: Prisma.bbs_articlesGetPayload<ReturnType<typeof select>>,
    ): IBbsArticle => ({
      id: input.id,
      snapshots: input.snapshots
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .map(BbsArticleSnapshotProvider.json.transform),
      created_at: input.created_at.toISOString(),
    });

    export const select = () =>
      Prisma.validator<Prisma.bbs_articlesFindManyArgs>()({
        include: {
          snapshots: BbsArticleSnapshotProvider.json.select(),
        } as const,
      });
  }

  export namespace abridge {
    export const paginate = (
      input: IBbsArticle.IRequest,
    ): Promise<IPage<IBbsArticle.IAbridge>> =>
      PaginationUtil.paginate({
        schema: MyGlobal.prisma.bbs_articles,
        payload: abridge.select,
        transform: abridge.transform,
      })({
        where: search(input.search ?? {}),
        orderBy: input.sort?.length
          ? PaginationUtil.orderBy(orderBy)(input.sort)
          : [{ created_at: "desc" }],
      })(input);
    export const transform = (
      input: Prisma.bbs_articlesGetPayload<ReturnType<typeof select>>,
    ): IBbsArticle.IAbridge => ({
      id: input.id,
      title: input.mv_last!.snapshot.title,
      body: input.mv_last!.snapshot.body,
      format: input.mv_last!.snapshot.format as IBbsArticle.Format,
      created_at: input.created_at.toISOString(),
      updated_at: input.mv_last!.snapshot.created_at.toISOString(),
      files: input.mv_last!.snapshot.to_files.map((p) =>
        AttachmentFileProvider.json.transform(p.file),
      ),
    });
    export const select = () =>
      Prisma.validator<Prisma.bbs_articlesFindManyArgs>()({
        include: {
          mv_last: {
            include: {
              snapshot: {
                include: {
                  to_files: {
                    include: {
                      file: AttachmentFileProvider.json.select(),
                    },
                  },
                },
              },
            },
          },
        } as const,
      });
  }

  export namespace summarize {
    export const paginate = (
      input: IBbsArticle.IRequest,
    ): Promise<IPage<IBbsArticle.ISummary>> =>
      PaginationUtil.paginate({
        schema: MyGlobal.prisma.bbs_articles,
        payload: summarize.select,
        transform: summarize.transform,
      })({
        where: search(input.search ?? {}),
        orderBy: input.sort?.length
          ? PaginationUtil.orderBy(orderBy)(input.sort)
          : [{ created_at: "desc" }],
      })(input);
    export const transform = (
      input: Prisma.bbs_articlesGetPayload<ReturnType<typeof select>>,
    ): IBbsArticle.ISummary => ({
      id: input.id,
      title: input.mv_last!.snapshot.title,
      created_at: input.created_at.toISOString(),
      updated_at: input.mv_last!.snapshot.created_at.toISOString(),
    });
    export const select = () =>
      Prisma.validator<Prisma.bbs_articlesFindManyArgs>()({
        include: {
          mv_last: {
            include: {
              snapshot: {
                select: {
                  title: true,
                  created_at: true,
                },
              },
            },
          },
        } as const,
      });
  }

  export const search = (input: IBbsArticle.IRequest.ISearch | undefined) =>
    Prisma.validator<Prisma.bbs_articlesWhereInput["AND"]>()([
      ...(input?.title?.length
        ? [
            {
              mv_last: {
                snapshot: {
                  title: {
                    contains: input.title,
                  },
                },
              },
            },
          ]
        : []),
      ...(input?.body?.length
        ? [
            {
              mv_last: {
                snapshot: {
                  body: {
                    contains: input.body,
                  },
                },
              },
            },
          ]
        : []),
      ...(input?.title_or_body?.length
        ? [
            {
              OR: [
                {
                  mv_last: {
                    snapshot: {
                      title: {
                        contains: input.title_or_body,
                      },
                    },
                  },
                },
                {
                  mv_last: {
                    snapshot: {
                      body: {
                        contains: input.title_or_body,
                      },
                    },
                  },
                },
              ],
            },
          ]
        : []),
      ...(input?.from?.length
        ? [
            {
              created_at: {
                gte: new Date(input.from),
              },
            },
          ]
        : []),
      ...(input?.to?.length
        ? [
            {
              created_at: {
                lte: new Date(input.to),
              },
            },
          ]
        : []),
    ]);

  export const orderBy = (
    key: IBbsArticle.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    Prisma.validator<Prisma.bbs_articlesOrderByWithRelationInput>()(
      key === "title"
        ? { mv_last: { snapshot: { title: value } } }
        : key === "created_at"
          ? { created_at: value }
          : // updated_at
            { mv_last: { snapshot: { created_at: value } } },
    );

  export const collect =
    <
      Input extends IBbsArticle.IStore,
      Snapshot extends Prisma.bbs_article_snapshotsCreateWithoutArticleInput,
    >(
      snapshotFactory: (input: Input) => Snapshot,
    ) =>
    (input: Input) => {
      const snapshot = snapshotFactory(input);
      return Prisma.validator<Prisma.bbs_articlesCreateInput>()({
        id: v4(),
        snapshots: {
          create: [snapshot],
        },
        created_at: new Date(),
        deleted_at: null,
        mv_last: {
          create: {
            snapshot: { connect: { id: snapshot.id } },
          },
        },
      });
    };
}
