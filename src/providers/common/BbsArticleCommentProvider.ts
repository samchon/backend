import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IBbsArticle } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IBbsArticle";
import { IBbsArticleComment } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IBbsArticleComment";
import { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IPage";

import { MyGlobal } from "../../MyGlobal";
import { PaginationUtil } from "../../utils/PaginationUtil";
import { BbsArticleCommentSnapshotProvider } from "./BbsArticleCommentSnapshotProvider";

export namespace BbsArticleCommentProvider {
  export namespace json {
    export const transform = (
      input: Prisma.bbs_article_commentsGetPayload<ReturnType<typeof select>>,
    ): IBbsArticleComment => ({
      id: input.id,
      parent_id: input.parent_id,
      snapshots: input.snapshots
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .map(BbsArticleCommentSnapshotProvider.json.transform),
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      Prisma.validator<Prisma.bbs_article_commentsFindManyArgs>()({
        include: {
          snapshots: BbsArticleCommentSnapshotProvider.json.select(),
        } as const,
      });
  }

  export const paginate = (
    input: IBbsArticleComment.IRequest,
  ): Promise<IPage<IBbsArticleComment>> =>
    PaginationUtil.paginate({
      schema: MyGlobal.prisma.bbs_article_comments,
      payload: json.select,
      transform: json.transform,
    })({
      where: search(input.search ?? {}),
      orderBy: input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(input.sort)
        : [{ created_at: "asc" }],
    })(input);

  export const search = (
    input: IBbsArticleComment.IRequest.ISearch | undefined,
  ) =>
    Prisma.validator<Prisma.bbs_article_commentsWhereInput["AND"]>()(
      input?.body?.length
        ? [
            {
              snapshots: {
                some: {
                  body: {
                    contains: input.body,
                  },
                },
              },
            },
          ]
        : [],
    );

  export const orderBy = (
    _key: IBbsArticleComment.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    Prisma.validator<Prisma.bbs_article_commentsOrderByWithRelationInput>()({
      created_at: value,
    });

  export const collect =
    <
      Input extends IBbsArticleComment.IStore,
      Snapshot extends
        Prisma.bbs_article_comment_snapshotsCreateWithoutCommentInput,
    >(
      snapshotFactory: (input: Input) => Snapshot,
    ) =>
    (related: { article: Pick<IBbsArticle, "id"> }) =>
    (input: Input) => {
      const snapshot = snapshotFactory(input);
      return Prisma.validator<Prisma.bbs_article_commentsCreateInput>()({
        id: v4(),
        article: {
          connect: { id: related.article.id },
        },
        snapshots: {
          create: [snapshot],
        },
        created_at: new Date(),
      });
    };
}
