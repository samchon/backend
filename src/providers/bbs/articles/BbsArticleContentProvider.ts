import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { IBbsArticle } from "../../../api/structures/bbs/articles/IBbsArticle";

import { __MvBbsArticleLastContent } from "../../../models/material/bbs/__MvBbsArticleLastContent";
import { AttachmentFileProvider } from "../../misc/AttachmentFileProvider";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsArticleContentFile } from "../../../models/tables/bbs/articles/BbsArticleContentFile";

export namespace BbsArticleContentProvider
{
    export function json()
    {
        return json_builder.get();
    }
    const json_builder = new Singleton(() => safe.createJsonSelectBuilder
    (
         BbsArticleContent,
         {
             files: AttachmentFileProvider.json(),
             article: undefined,
             reviewContent: undefined,
             __mv_last: undefined
         }
    ));

    export function collect
        (
            collection: safe.InsertCollection, 
            article: BbsArticle,
            input: IBbsArticle.IStore,
            newbie: boolean
        ): BbsArticleContent
    {
        // THE CONTENT
        const content: BbsArticleContent = BbsArticleContent.initialize({
            id: safe.DEFAULT,
            article,
            title: input.title,
            body: input.body,
            created_at: safe.DEFAULT
        });
        collection.push(content);

        // ATTACHMENT FILES
        AttachmentFileProvider.collectList(collection, input.files, 
            (file, sequence) => BbsArticleContentFile.initialize({
                id: safe.DEFAULT,
                content,
                file,
                sequence
            }));

        // LAST CONTENT PAIRING
        if (newbie === true)
            collection.push(__MvBbsArticleLastContent.initialize({
                article,
                content
            }));
        else
            collection.after(manager => __MvBbsArticleLastContent.emplace(manager, article, content));

        return content;
    }

    export async function update
        (
            article: BbsArticle, 
            input: IBbsArticle.IStore
        ): Promise<BbsArticleContent>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const content: BbsArticleContent = collect(collection, article, input, false);

        await collection.execute();
        return content;
    }
}