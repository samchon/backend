import safe from "safe-typeorm";
import { OutOfRange } from "tstl/exception/OutOfRange";
import { Singleton } from "tstl/thread/Singleton";

import { IBbsArticle } from "../../../api/structures/common/bbs/IBbsArticle";

import { __MvBbsArticleLastContent } from "../../../models/material/common/__MvBbsArticleLastContent";
import { BbsArticle } from "../../../models/tables/common/bbs/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/common/bbs/BbsArticleContent";

import { BbsArticleContentProvider } from "./BbsArticleContentProvider";

export namespace BbsArticleProvider
{
    /* ----------------------------------------------------------------
        INDEX
    ---------------------------------------------------------------- */
    export function summarize()
    {
        return summarize_builder_.get();
    }

    const summarize_builder_ = new Singleton(() => BbsArticle.createJsonSelectBuilder
    (
        {
            __mv_last: __MvBbsArticleLastContent.createJsonSelectBuilder
            (
                {
                    content: "join" as const
                },
                output => output.content
            ),
        },
        output => 
        {
            const content = output.__mv_last;
            if (content === null)
                throw new OutOfRange("Error on ArticleProvider.summarize(): no content exists.");

            return {
                id: output.id,
                title: content.title,
                created_at: output.created_at,
                updated_at: content.created_at
            };
        }
    ));

    export function abridge()
    {
        return abridge_builder_.get();
    }

    const abridge_builder_ = new Singleton(() => BbsArticle.createJsonSelectBuilder
    (
        {
            __mv_last: __MvBbsArticleLastContent.createJsonSelectBuilder
            ({
                content: BbsArticleContentProvider.json()
            }),
        },
        article => 
        {
            const output: IBbsArticle.IAbridge = {
                ...article.__mv_last!.content,
                id: article.id,
                created_at: article.created_at,
                updated_at: article.__mv_last!.content.created_at
            };
            return output;
        }
    ));

    /* ----------------------------------------------------------------
        READERS
    ---------------------------------------------------------------- */
    export function json()
    {
        return json_builder_.get();
    }

    const json_builder_ = new Singleton(() => BbsArticle.createJsonSelectBuilder({
        contents: BbsArticleContentProvider.json(),
    }));

    export async function replica(article: BbsArticle): Promise<IBbsArticle.IStore | null>
    {
        const pair: __MvBbsArticleLastContent | null = await article.__mv_last.get();
        if (pair === null)
            return null;

        const content: BbsArticleContent = await pair.content.get();        
        return await BbsArticleContentProvider.replica(content);
    }

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export async function collect
        (
            collection: safe.InsertCollection,
            input: IBbsArticle.IStore | null
        ): Promise<BbsArticle>
    {
        const article: BbsArticle = BbsArticle.initialize({
            id: safe.DEFAULT,
            created_at: safe.DEFAULT,
            deleted_at: null
        });

        if (input !== null)
        {
            const content: BbsArticleContent = await BbsArticleContentProvider.collect
            (
                collection, 
                article, 
                input
            );
            await article.contents.set([ content ]);
        }        
        return collection.push(article);
    }
}