import models from "@modules/models";
import { v4 } from "uuid";

import { IBbsArticle } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IBbsArticle";
import { IBbsArticleComment } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IBbsArticleComment";

import { BbsArticleCommentSnapshotProvider } from "./BbsArticleCommentSnapshotProvider";

export namespace BbsArticleCommentProvider {
    export namespace json {
        export const select = () => ({
            include: {
                snapshots: BbsArticleCommentSnapshotProvider.json.select(),
            } as const,
        });
        export const transform = (
            input: models.bbs_article_commentsGetPayload<
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
    }

    export const orderBy = (
        key: IBbsArticleComment.IRequest.SortableColumns,
        value: "asc" | "desc",
    ): models.bbs_article_commentsOrderByWithRelationInput | null =>
        key === "created_at" ? { created_at: value } : null;

    export const collect =
        <Input extends IBbsArticleComment.IStore>(
            factory: (
                input: Input,
            ) => Omit<
                models.bbs_article_comment_snapshotsCreateInput,
                "comment"
            >,
        ) =>
        (related: { article: Pick<IBbsArticle, "id"> }) =>
        (input: Input): models.bbs_article_commentsCreateInput => ({
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
