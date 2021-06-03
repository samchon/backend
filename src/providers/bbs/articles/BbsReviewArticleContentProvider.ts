import safe from "safe-typeorm";
import { IBbsReviewArticle } from "../../../api/structures/bbs/articles/IBbsReviewArticle";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";

import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsReviewArticleContent } from "../../../models/tables/bbs/articles/BbsReviewArticleContent";

import { BbsArticleContentProvider } from "./BbsArticleContentProvider";

export namespace BbsReviewArticleContentProvider
{
    export async function json
        (content: BbsArticleContent): Promise<IBbsReviewArticle.IContent>
    {
        const derived: BbsReviewArticleContent = (await content.reviewContent.get())!;

        return {
            ...await BbsArticleContentProvider.json(content),
            score: derived.score
        };
    }

    export function collect
        (
            collection: safe.InsertCollection,
            article: BbsArticle,
            input: IBbsReviewArticle.IUpdate,
            newbie: boolean
        ): BbsArticleContent
    {
        const base: BbsArticleContent = BbsArticleContentProvider.collect
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
        base.reviewContent.set(derived);
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
        const content: BbsArticleContent = collect(collection, article, input, false);

        await collection.execute();
        return content;
    }
}