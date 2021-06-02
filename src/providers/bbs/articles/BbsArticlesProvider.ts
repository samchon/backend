import safe from "safe-typeorm";
import * as orm from "typeorm";
import { IBbsArticle } from "../../../api/structures/bbs/articles/IBbsArticle";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { Citizen } from "../../../models/tables/members/Citizen";
import { ArrayUtil } from "../../../utils/ArrayUtil";

export namespace BbsArticlesProvider
{
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
}