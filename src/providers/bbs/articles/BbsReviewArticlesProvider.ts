import * as orm from "typeorm";

import { IBbsReviewArticle } from "../../../api/structures/bbs/articles/IBbsReviewArticle";

import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsCustomer } from "../../../models/tables/bbs/actors/BbsCustomer";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { BbsReviewArticle } from "../../../models/tables/bbs/articles/BbsReviewArticle";
import { Citizen } from "../../../models/tables/members/Citizen";
import { __MvBbsArticleHit } from "../../../models/material/bbs/__MvBbsArticleHit";

import { BbsArticlesProvider } from "./BbsArticlesProvider";
import { BbsArticleContentProvider } from "./BbsArticleContentProvider";
import { BbsCustomerProvider } from "../actors/BbsCustomerProvider";

export namespace BbsReviewArticlesController
{
    export function statement
        (
            section: BbsSection, 
            input: IBbsReviewArticle.IRequest.ISearch | null
        ): orm.SelectQueryBuilder<BbsReviewArticle>
    {
        const stmt: orm.SelectQueryBuilder<BbsReviewArticle> = BbsReviewArticle
            .createJoinQueryBuilder(review =>
            {
                review.innerJoin("customer")
                    .innerJoin("citizen");
                review.innerJoin("base", article =>
                {
                    article.innerJoin("__mv_hit");
                    article.innerJoin("__mv_last")
                        .innerJoin("content")
                        .innerJoin("reviewContent");
                });
            })
            .andWhere(...BbsArticle.getWhereArguments("section", "=", section))
            .select([
                BbsArticle.getColumn("id"),
                Citizen.getColumn("name", "customer"),
                BbsReviewArticle.getColumn("brand"),
                BbsReviewArticle.getColumn("manufacturer"),
                BbsReviewArticle.getColumn("product"),
                BbsReviewArticle.getColumn("purchased_at"),
                BbsArticle.getColumn("created_at"),
                BbsArticleContent.getColumn("created_at", "updated_at")
            ])
            .orderBy(BbsArticle.getColumn("created_at", null), "DESC");

        if (input !== null)
        {
            if (input.brand)
                stmt.andWhere(...BbsReviewArticle.getWhereArguments("brand", "LIKE", `%${input.brand}%`));
            if (input.manufacturer)
                stmt.andWhere(...BbsReviewArticle.getWhereArguments("manufacturer", "LIKE", `%${input.manufacturer}%`));
            if (input.product)
                stmt.andWhere(...BbsReviewArticle.getWhereArguments("product", "LIKE", `%${input.product}%`));
            
            BbsArticlesProvider.search(stmt, input);
        }
        return stmt;
    }

    export async function json(review: BbsReviewArticle): Promise<IBbsReviewArticle>
    {
        const base: BbsArticle = await review.base.get();
        const customer: BbsCustomer<true> = await review.customer.get();
        const hit: __MvBbsArticleHit | null = await base.__mv_hit.get();

        return {
            ...review.toPrimitive(),
            ...await BbsArticlesProvider.json(base, async content =>
            {
                const reviewContent = (await content.reviewContent.get())!;
                return {
                    ...await BbsArticleContentProvider.json(content),
                    score: reviewContent.score
                }
            }),
            customer: await BbsCustomerProvider.json(customer),
            hit: (hit !== null)
                ? hit.count 
                : 0
        };
    }
}