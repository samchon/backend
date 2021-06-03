import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "../../tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../tables/bbs/articles/BbsArticleContent";

@orm.Entity()
export class __MvBbsArticleLastContent extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
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

    /* -----------------------------------------------------------
        EMPLACER
    ----------------------------------------------------------- */
    public static async emplace
        (
            manager: orm.EntityManager, 
            article: BbsArticle,
            content: BbsArticleContent,
        ): Promise<__MvBbsArticleLastContent>
    {
        // FIND ORDINARY MATERIAL
        let material: __MvBbsArticleLastContent | undefined = await this
            .createQueryBuilder()
            .andWhere(...__MvBbsArticleLastContent.getWhereArguments("article", "=", article))
            .getOne();
        if (material !== undefined)
        {
            material.article.set(article);
            material.content.set(content);
            await material.update(manager);
        }
        else
        {
            // SPECIAL CASE, CREATE NEW ONE
            material = this.initialize({
                article,
                content
            });
            await material.insert(manager);
        }

        // RETURNS WITH PARING
        article.__mv_last.set(material);
        content.__mv_last.set(material);
        return material;
    }
}