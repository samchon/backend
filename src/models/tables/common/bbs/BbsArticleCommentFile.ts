import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticleComment } from "./BbsArticleComment";
import { FilePairBase } from "../internal/FilePairBase";

@orm.Entity()
export class BbsArticleCommentFile 
    extends FilePairBase
{
    @safe.Belongs.ManyToOne(() => BbsArticleComment,
        "uuid",
        "bbs_article_comment_id",
        { index: true }
    )
    public readonly comment!: safe.Belongs.ManyToOne<BbsArticleComment, "uuid">;
}