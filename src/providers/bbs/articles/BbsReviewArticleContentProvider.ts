import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";
import { IBbsReviewArticle } from "../../../api/structures/bbs/articles/IBbsReviewArticle";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";

import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsReviewArticleContent } from "../../../models/tables/bbs/articles/BbsReviewArticleContent";

import { BbsArticleContentProvider } from "./BbsArticleContentProvider";

export namespace BbsReviewArticleContentProvider
{
    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export function json(): safe.JsonSelectBuilder<BbsReviewArticleContent, any, IBbsReviewArticle.IContent>
    {
        return json_builder.get();
    }

    const json_builder = new Singleton(() => safe.createJsonSelectBuilder
    (
        BbsReviewArticleContent,
        { base: BbsArticleContentProvider.json() },
        output => ({
            ...output,
            ...output.base,
            base: undefined
        })
    ));

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export async function collect
        (
            collection: safe.InsertCollection,
            article: BbsArticle,
            input: IBbsReviewArticle.IUpdate,
            newbie: boolean
        ): Promise<BbsArticleContent>
    {
        const base: BbsArticleContent = await BbsArticleContentProvider.collect
        (
            collection, 
            article, 
            input, 
            newbie
        );

        const derived: BbsReviewArticleContent = BbsReviewArticleContent.initialize({
            base,
            score: input.score
        });
        await base.reviewContent.set(derived);
        collection.push(derived);

        return base;
    }

    export async function update
        (
            article: BbsArticle, 
            input: IBbsReviewArticle.IUpdate
        ): Promise<BbsArticleContent>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const content: BbsArticleContent = await collect(collection, article, input, false);

        await collection.execute();
        return content;
    }
}