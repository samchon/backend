import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { IBbsArticle } from "../../../api/structures/common/bbs/IBbsArticle";

import { __MvBbsArticleLastContent } from "../../../models/material/common/__MvBbsArticleLastContent";
import { BbsArticle } from "../../../models/tables/common/bbs/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/common/bbs/BbsArticleContent";
import { BbsArticleContentFile } from "../../../models/tables/common/bbs/BbsArticleContentFile";
import { AttachmentFile } from "../../../models/tables/common/AttachmentFile";

import { AttachmentFileProvider } from "../AttachmentFileProvider";

export namespace BbsArticleContentProvider
{
    /* ----------------------------------------------------------------
        READERS
    ---------------------------------------------------------------- */
    export function json()
    {
        return json_builder_.get();
    }

    const json_builder_ = new Singleton(() => BbsArticleContent.createJsonSelectBuilder
    (
        {
            files: "join" as const,
        }
    ));

    export async function replica(content: BbsArticleContent): Promise<IBbsArticle.IStore>
    {
        const files: AttachmentFile[] = await content.files.get();
        return {
            format: content.format,
            title: content.title,
            body: content.body,
            files: files.map(f => AttachmentFileProvider.replica(f))
        };
    }

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export async function store
        (
            article: BbsArticle,
            input: IBbsArticle.IStore,
        ): Promise<BbsArticleContent>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const content: BbsArticleContent = await collect
        (
            collection,
            article,
            input
        );

        await collection.execute();
        return content;
    }

    export async function overwrite
        (
            article: BbsArticle,
            input: IBbsArticle.IStore,
        ): Promise<BbsArticleContent>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const content: BbsArticleContent = await collect_overwrite(collection, article, input);

        await collection.execute();
        return content;
    }

    export async function clear
        (
            article: BbsArticle,
            memoize: boolean = true
        ): Promise<void>
    {
        // MEMORIZE
        await article.__mv_last.set(null);
        if (memoize === true)
            await article.contents.set([]);

        // DO REMOVE
        const stmt = BbsArticleContent
            .createQueryBuilder()
            .andWhere(...BbsArticleContent.getWhereArguments(".article", article))
            .delete();
        await stmt.execute();
    }

    /* ----------------------------------------------------------------
        COLLECTORS
    ---------------------------------------------------------------- */
    export async function collect
        (
            collection: safe.InsertCollection,
            article: BbsArticle,
            input: IBbsArticle.IStore
        ): Promise<BbsArticleContent>
    {
        // BASIC CONTENT
        const content: BbsArticleContent = BbsArticleContent.initialize({
            id: safe.DEFAULT,
            article,
            format: input.format,
            title: input.title,
            body: input.body,
            created_at: safe.DEFAULT,
        });

        // ATTACHED FILES
        const files: AttachmentFile[] = input.files.map
        (
            (file, index) => AttachmentFileProvider.collect
            (
                collection,
                file,
                file => BbsArticleContentFile.initialize({
                    id: safe.DEFAULT,
                    content,
                    file,
                    sequence: index + 1
                })
            )
        );
        await content.files.set(files);

        // RETURNS WITH LAST PARING
        collection.after(() => __MvBbsArticleLastContent.emplace
        (
            article,
            content
        ));
        return collection.push(content);
    }

    export async function collect_overwrite
        (
            collection: safe.InsertCollection, 
            article: BbsArticle,
            input: IBbsArticle.IStore
        ): Promise<BbsArticleContent>
    {
        await collect_clear(collection, article);
        const content: BbsArticleContent = await collect
        (
            collection, 
            article, 
            input
        );
        await article.contents.set([ content ]);
        return content;
    }

    export async function collect_clear
        (
            collection: safe.InsertCollection, 
            article: BbsArticle
        ): Promise<void>
    {
        await article.contents.set([]);
        collection.before(() => clear(article, false));
    }
}