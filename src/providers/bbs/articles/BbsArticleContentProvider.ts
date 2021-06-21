import { IBbsArticle } from "../../../api/structures/bbs/articles/IBbsArticle";

import { AttachmentFile } from "../../../models/tables/misc/AttachmentFile";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import safe from "safe-typeorm";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { AttachmentFileProvider } from "../../misc/AttachmentFileProvider";
import { BbsArticleContentFile } from "../../../models/tables/bbs/articles/BbsArticleContentFile";
import { __MvBbsArticleLastContent } from "../../../models/material/bbs/__MvBbsArticleLastContent";

export namespace BbsArticleContentProvider
{
    export async function json(content: BbsArticleContent): Promise<IBbsArticle.IContent>
    {
        const files: AttachmentFile[] = await content.files.get();

        return {
            ...content.toPrimitive(),
            files: files.map(f => f.toPrimitive())
        };
    }

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