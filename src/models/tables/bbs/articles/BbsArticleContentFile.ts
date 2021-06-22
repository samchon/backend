import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticleContent } from "./BbsArticleContent";
import { FilePairBase } from "../../misc/internal/FilePairBase";

@orm.Unique(["bbs_article_content_id", "attachment_file_id"])
@orm.Entity()
export class BbsArticleContentFile extends FilePairBase
{
    @safe.Belongs.ManyToOne(() => BbsArticleContent,
        "uuid",
        "bbs_article_content_id"
    )
    public readonly content!: safe.Belongs.ManyToOne<BbsArticleContent, "uuid">;
}
