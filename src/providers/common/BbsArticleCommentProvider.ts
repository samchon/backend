import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IBbsArticle } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IBbsArticle";
import { IBbsArticleComment } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IBbsArticleComment";
import { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IPage";

import { SGlobal } from "../../SGlobal";
import { PaginationUtil } from "../../utils/PaginationUtil";
import { BbsArticleCommentSnapshotProvider } from "./BbsArticleCommentSnapshotProvider";

export namespace BbsArticleCommentProvider {
    export namespace json {
        export const transform = (
            input: Prisma.bbs_article_commentsGetPayload<
                ReturnType<typeof select>
            >,
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
            schema: SGlobal.prisma.bbs_article_comments,
            payload: json.select,
            transform: json.transform,
        })({
            where: where(input.search ?? {}),
            orderBy: input.sort?.length
                ? PaginationUtil.orderBy(orderBy)(input.sort)
                : [{ created_at: "asc" }],
        })(input);

    export const where = (input: IBbsArticleComment.IRequest.ISearch) =>
        Prisma.validator<Prisma.bbs_article_commentsWhereInput>()(
            input.body?.length
                ? { snapshots: { some: { body: { contains: input.body } } } }
                : {},
        );

    export const orderBy = (
        key: IBbsArticleComment.IRequest.SortableColumns,
        value: "asc" | "desc",
    ): Prisma.bbs_article_commentsOrderByWithRelationInput | null =>
        key === "created_at" ? { created_at: value } : null;

    export const collect =
        <Input extends IBbsArticleComment.IStore>(
            factory: (
                input: Input,
            ) => Omit<
                Prisma.bbs_article_comment_snapshotsCreateInput,
                "comment"
            >,
        ) =>
        (related: { article: Pick<IBbsArticle, "id"> }) =>
        (input: Input): Prisma.bbs_article_commentsCreateInput => ({
            id: v4(),
            article: {
                connect: { id: related.article.id },
            },
            snapshots: {
                create: [factory(input)],
            },
            created_at: new Date(),
        });
}
