import * as orm from "typeorm";
import safe from "safe-typeorm";
import { BbsArticle } from "../../tables/bbs/articles/BbsArticle";

@orm.Entity()
export class __MvBbsArticleHit extends safe.Model
{
    @safe.Belongs.OneToOne(() => BbsArticle,
        article => article.__mv_hit,
        "uuid",
        "bbs_article_id",
        { primary: true }
    )
    public readonly article!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @orm.Column("int", { unsigned: true })
    public readonly count!: number;
}