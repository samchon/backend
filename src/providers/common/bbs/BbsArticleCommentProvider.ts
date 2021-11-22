import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { IBbsArticleComment } from "../../../api/structures/common/bbs/IBbsArticleComment";

import { AttachmentFile } from "../../../models/tables/common/AttachmentFile";
import { BbsArticle } from "../../../models/tables/common/bbs/BbsArticle";
import { BbsArticleComment } from "../../../models/tables/common/bbs/BbsArticleComment";
import { BbsArticleCommentFile } from "../../../models/tables/common/bbs/BbsArticleCommentFile";

import { AttachmentFileProvider } from "../AttachmentFileProvider";

export namespace BbsArticleCommentProvider
{
    /* ----------------------------------------------------------------
        READERS
    ---------------------------------------------------------------- */
    export function json(): safe.JsonSelectBuilder<BbsArticleComment, any, IBbsArticleComment>
    {
        return json_builder_.get();
    }

    const json_builder_ = new Singleton(() => BbsArticleComment.createJsonSelectBuilder
    (
        {
            files: "join" as const
        }
    ));

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export async function collect
        (
            collection: safe.InsertCollection,
            article: BbsArticle,
            input: IBbsArticleComment.IStore
        ): Promise<BbsArticleComment>
    {
        const comment: BbsArticleComment = BbsArticleComment.initialize({
            id: safe.DEFAULT,
            article,
            format: input.format,
            content: input.content,
            created_at: safe.DEFAULT,
            deleted_at: null
        });

        const files: AttachmentFile[] = (input.files || []).map
        (
            (file, index) => AttachmentFileProvider.collect
            (
                collection,
                file,
                file => BbsArticleCommentFile.initialize({
                    id: safe.DEFAULT,
                    comment,
                    file,
                    sequence: index + 1
                })
            )
        );
        await comment.files.set(files);

        return collection.push(comment);
    }
}