import orm from "@modules/typeorm";
import safe from "safe-typeorm";

import { FilePairBase } from "../internal/FilePairBase";
import { BbsArticleComment } from "./BbsArticleComment";

@orm.Entity()
export class BbsArticleCommentFile extends FilePairBase {
    @safe.Belongs.ManyToOne(
        () => BbsArticleComment,
        "uuid",
        "bbs_article_comment_id",
        { index: true },
    )
    public readonly comment!: safe.Belongs.ManyToOne<BbsArticleComment, "uuid">;
}
