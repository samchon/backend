import safe from "safe-typeorm";
import * as orm from "typeorm";

import { IBbsArticle } from "../../../api/structures/bbs/articles/IBbsArticle";
import { __MvBbsArticleHit } from "../../../models/material/bbs/__MvBbsArticleHit";

import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsSection } from "../../../models/tables/bbs/systematic/BbsSection";
import { Citizen } from "../../../models/tables/members/Citizen";

import { ArrayUtil } from "../../../utils/ArrayUtil";

export namespace BbsArticleProvider
{
    /* ----------------------------------------------------------------
        INDEX
    ---------------------------------------------------------------- */
    export function search<Entity extends BbsArticle.ISubType>
        (
            stmt: orm.SelectQueryBuilder<Entity>,
            input: IBbsArticle.IRequest.ISearch
        ): void
    {
        if (input.title)
            stmt.andWhere(...BbsArticleContent.getWhereArguments("title", "LIKE", `%${input.title}%`));
        if (input.body)
            stmt.andWhere(...BbsArticleContent.getWhereArguments("body", "LIKE", `%${input.body}%`));
        if (input.writer)
            stmt.andWhere(...Citizen.getWhereArguments("name", "=", 
                safe.AesPkcs5.encode
                (
                    input.writer, 
                    Citizen.ENCRYPTION_PASSWORD.key, 
                    Citizen.ENCRYPTION_PASSWORD.iv
                )
            ))
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export function find
        (
            section: BbsSection,
            id: string
        ): Promise<BbsArticle>
    {
        return BbsArticle
            .createQueryBuilder()
            .andWhere(...BbsArticle.getWhereArguments("section", section))
            .andWhere(...BbsArticle.getWhereArguments("id", id))
            .getOneOrFail();
    }

    export async function json<Content extends IBbsArticle.IContent>
        (
            article: BbsArticle,
            contentGetter: (content: BbsArticleContent) => Promise<Content>
        ): Promise<IBbsArticle<Content>>
    {
        const contents: BbsArticleContent[] = await article.contents.get();

        return {
            id: article.id,
            contents: await ArrayUtil.asyncMap(contents, c => contentGetter(c)),
            created_at: article.created_at.toString()
        };
    }

    /* ----------------------------------------------------------------
        SAVE
    ---------------------------------------------------------------- */
    export function collect<Store extends IBbsArticle.IStore>
        (
            collection: safe.InsertCollection,
            section: BbsSection,
            input: Store,
            contentCollector: 
                (
                    collection: safe.InsertCollection, 
                    article: BbsArticle, 
                    input: Store,
                    newbie: boolean
                ) => BbsArticleContent,
            hit: boolean
        ): BbsArticle
    {
        // MAIN ARTICLE
        const article: BbsArticle = BbsArticle.initialize
        ({
            id: safe.DEFAULT,
            section,
            created_at: safe.DEFAULT
        });
        collection.push(article);

        // THE FIRST CONTENT
        const content: BbsArticleContent = contentCollector
        (
            collection, 
            article, 
            input, 
            true
        );
        article.contents.set([content]);

        // MV - HIT
        if (hit === true)
            collection.push(__MvBbsArticleHit.initialize({
                article,
                count: 0
            }));

        return article;
    }
}