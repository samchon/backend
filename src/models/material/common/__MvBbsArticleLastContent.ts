/**
 * @packageDocumentation
 * @module models.material.common
 */
//================================================================
import orm from "@modules/typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "../../tables/common/bbs/BbsArticle";
import { BbsArticleContent } from "../../tables/common/bbs/BbsArticleContent";

@orm.Entity()
export class __MvBbsArticleLastContent extends safe.Model {
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @safe.Belongs.OneToOne(
        () => BbsArticle,
        (article) => article.__mv_last,
        "uuid",
        "bbs_article_id",
        { primary: true },
    )
    public readonly article!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @safe.Belongs.OneToOne(
        () => BbsArticleContent,
        (content) => content.__mv_last,
        "uuid",
        "bbs_article_content_id",
        { unique: true },
    )
    public readonly content!: safe.Belongs.OneToOne<BbsArticleContent, "uuid">;

    /* -----------------------------------------------------------
        EMPLACER
    ----------------------------------------------------------- */
    public static async emplace(
        article: BbsArticle,
        content: BbsArticleContent,
    ): Promise<__MvBbsArticleLastContent> {
        // FIND ORDINARY MATERIAL
        const oldbie: __MvBbsArticleLastContent | undefined =
            await this.createQueryBuilder()
                .andWhere(...this.getWhereArguments("article", "=", article))
                .getOne();
        if (oldbie) await update(content, oldbie);

        // OR INSERT NEW MATERIAL
        const material: __MvBbsArticleLastContent =
            oldbie || (await insert(article, content));

        // RETURNS WITH PAIRING
        await content.__mv_last.set(material);
        return material;
    }
}

async function update(
    content: BbsArticleContent,
    material: __MvBbsArticleLastContent,
): Promise<void> {
    await material.content.set(content);
    await material.update();
}

async function insert(
    article: BbsArticle,
    content: BbsArticleContent,
): Promise<__MvBbsArticleLastContent> {
    const material: __MvBbsArticleLastContent =
        __MvBbsArticleLastContent.initialize({
            article,
            content,
        });
    await article.__mv_last.set(material);
    await content.__mv_last.set(material);

    await material.insert();
    return material;
}
