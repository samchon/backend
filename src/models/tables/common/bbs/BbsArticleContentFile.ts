import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticleContent } from "./BbsArticleContent";
import { FilePairBase } from "../internal/FilePairBase";

@orm.Entity()
export class BbsArticleContentFile 
    extends FilePairBase
{
    @safe.Belongs.ManyToOne(() => BbsArticleContent, 
        "uuid",
        "bbs_article_content_id",
        { index: true }
    )
    public readonly content!: safe.Belongs.ManyToOne<BbsArticleContent, "uuid">;
}