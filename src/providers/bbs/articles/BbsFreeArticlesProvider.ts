import * as orm from "typeorm";

import { IBbsFreeArticle } from "../../../api/structures/bbs/articles/IBbsFreeArticle";

import { BbsCustomer } from "../../../models/tables/bbs/actors/BbsCustomer";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsFreeArticle } from "../../../models/tables/bbs/articles/BbsFreeArticle";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { Citizen } from "../../../models/tables/members/Citizen";
import { __MvBbsArticleHit } from "../../../models/material/bbs/__MvBbsArticleHit";

import { BbsArticlesProvider } from "./BbsArticlesProvider";
import { BbsArticleContentProvider } from "./BbsArticleContentProvider";
import { BbsCustomerProvider } from "../actors/BbsCustomerProvider";

export namespace BbsFreeArticlesProvider
{
    export function statement
        (
            section: BbsSection,
            input: IBbsFreeArticle.IRequest.ISearch | null
        ): orm.SelectQueryBuilder<BbsFreeArticle>
    {
        const stmt: orm.SelectQueryBuilder<BbsFreeArticle> = BbsFreeArticle
            .createJoinQueryBuilder(free =>
            {
                free.innerJoin("customer")
                    .innerJoin("citizen");
                free.innerJoin("base", article =>
                {
                    article.innerJoin("__mv_hit");
                    article.innerJoin("__mv_last")
                        .innerJoin("content");
                });
            })
            .andWhere(...BbsArticle.getWhereArguments("section", "=", section))
            .select([
                BbsArticle.getColumn("id"),
                Citizen.getColumn("name", "customer"),
                BbsArticle.getColumn("created_at"),
                BbsArticleContent.getColumn("created_at", "updated_at")
            ])
            .orderBy(BbsArticle.getColumn("created_at", null), "DESC");

        if (input !== null)
            BbsArticlesProvider.search(stmt, input);
        
        return stmt;
    }

    export async function json(free: BbsFreeArticle): Promise<IBbsFreeArticle>
    {
        const base: BbsArticle = await free.base.get();
        const customer: BbsCustomer<true> = await free.customer.get();
        const hit: __MvBbsArticleHit | null = await base.__mv_hit.get();

        return {
            ...await BbsArticlesProvider.json(base, BbsArticleContentProvider.json),
            customer: await BbsCustomerProvider.json(customer),
            hit: (hit !== null)
                ? hit.count 
                : 0
        };
    }
}