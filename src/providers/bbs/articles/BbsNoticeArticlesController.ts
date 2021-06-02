import * as orm from "typeorm";

import { IBbsNoticeArticle } from "../../../api/structures/bbs/articles/IBbsNoticeArticle";

import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsNoticeArticle } from "../../../models/tables/bbs/articles/BbsNoticeArticle";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { Citizen } from "../../../models/tables/members/Citizen";
import { __MvBbsArticleHit } from "../../../models/material/bbs/__MvBbsArticleHit";

import { BbsArticlesProvider } from "./BbsArticlesProvider";
import { BbsArticleContentProvider } from "./BbsArticleContentProvider";
import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsNoticeArticlesController
{
    export function statement
        (
            section: BbsSection,
            input: IBbsNoticeArticle.IRequest.ISearch | null
        ): orm.SelectQueryBuilder<BbsNoticeArticle>
    {
        const stmt: orm.SelectQueryBuilder<BbsNoticeArticle> = BbsNoticeArticle
            .createJoinQueryBuilder(notice =>
            {
                notice.innerJoin("manager")
                    .innerJoin("base")
                    .innerJoin("citizen");
                notice.innerJoin("base", article =>
                {
                    article.innerJoin("__mv_hit");
                    article.innerJoin("__mv_last")
                        .innerJoin("content");
                });
            })
            .andWhere(...BbsArticle.getWhereArguments("section", "=", section))
            .select([
                BbsArticle.getColumn("id"),
                Citizen.getColumn("name", "manager"),
                BbsArticle.getColumn("created_at"),
                BbsArticleContent.getColumn("created_at", "updated_at")
            ])
            .orderBy(BbsArticle.getColumn("created_at", null), "DESC");

        if (input !== null)
            BbsArticlesProvider.search(stmt, input);
        
        return stmt;
    }

    export async function json(free: BbsNoticeArticle): Promise<IBbsNoticeArticle>
    {
        const base: BbsArticle = await free.base.get();
        const manager: BbsManager = await free.manager.get();
        const hit: __MvBbsArticleHit | null = await base.__mv_hit.get();

        return {
            ...await BbsArticlesProvider.json(base, BbsArticleContentProvider.json),
            manager: await MemberProvider.json(await manager.base.get()),
            hit: (hit !== null)
                ? hit.count 
                : 0
        };
    }
}