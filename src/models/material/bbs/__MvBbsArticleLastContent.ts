import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "../../tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../tables/bbs/articles/BbsArticleContent";

@orm.Entity()
export class __MvBbsArticleLastContent extends safe.Model
{
    @safe.Belongs.OneToOne(() => BbsArticle,
        article => article.__mv_last,
        "uuid",
        "bbs_article_id",
        { primary: true }
    )
    public readonly article!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @safe.Belongs.OneToOne(() => BbsArticleContent,
        content => content.__mv_last,
        "uuid",
        "bbs_article_content_id",
        { unique: true }
    )
    public readonly content!: safe.Belongs.OneToOne<BbsArticleContent, "uuid">;
}