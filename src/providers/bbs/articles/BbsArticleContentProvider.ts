import { IBbsArticle } from "../../../api/structures/bbs/articles/IBbsArticle";

import { AttachmentFile } from "../../../models/tables/misc/AttachmentFile";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";

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
}