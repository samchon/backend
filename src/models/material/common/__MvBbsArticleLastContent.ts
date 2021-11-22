/**
 * @packageDocumentation
 * @module models.material.common
 */
//================================================================
import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "../../tables/common/bbs/BbsArticle";
import { BbsArticleContent } from "../../tables/common/bbs/BbsArticleContent";

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
            article: BbsArticle,
            content: BbsArticleContent
        ): Promise<__MvBbsArticleLastContent>
    {
        // FIND ORDINARY MATERIAL
        let material: __MvBbsArticleLastContent | undefined = await this
            .createQueryBuilder()
            .andWhere(...this.getWhereArguments("article", "=", article))
            .getOne();
        if (material !== undefined)
        {
            await material.content.set(content);
            await material.update();
        }
        else
        {
            // SPECIAL CASE, CREATE NEW ONE
            material = this.initialize({
                article,
                content
            });
            await article.__mv_last.set(material);
            await content.__mv_last.set(material);
            await material.insert();
        }

        // RETURNS WITH MATERIAL
        await content.__mv_last.set(material);
        return material;
    }
}