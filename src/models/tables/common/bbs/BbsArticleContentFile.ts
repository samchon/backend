import orm from "@modules/typeorm";
import safe from "safe-typeorm";

import { FilePairBase } from "../internal/FilePairBase";
import { BbsArticleContent } from "./BbsArticleContent";

@orm.Entity()
export class BbsArticleContentFile extends FilePairBase {
    @safe.Belongs.ManyToOne(
        () => BbsArticleContent,
        "uuid",
        "bbs_article_content_id",
        { index: true },
    )
    public readonly content!: safe.Belongs.ManyToOne<BbsArticleContent, "uuid">;
}
