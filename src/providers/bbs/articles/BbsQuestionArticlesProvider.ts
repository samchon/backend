import * as orm from "typeorm";

import { IBbsQuestionArticle } from "../../../api/structures/bbs/articles/IBbsQuestionArticle";

import { BbsAnswerArticle } from "../../../models/tables/bbs/articles/BbsAnswerArticle";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsQuestionArticle } from "../../../models/tables/bbs/articles/BbsQuestionArticle";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { Citizen } from "../../../models/tables/members/Citizen";

import { BbsArticlesProvider } from "./BbsArticlesProvider";

export namespace BbsQuestionArticlesProvider
{
    export function statement
        (
            section: BbsSection, 
            input: IBbsQuestionArticle.IRequest.ISearch | null
        ): orm.SelectQueryBuilder<BbsQuestionArticle>
    {
        const stmt: orm.SelectQueryBuilder<BbsQuestionArticle> = BbsQuestionArticle
            .createJoinQueryBuilder(review =>
            {
                review.leftJoin("answer")
                    .leftJoin("base", "AA");
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
                BbsArticle.getColumn("created_at"),
                BbsArticleContent.getColumn("created_at", "updated_at"),
                BbsArticle.getColumn("AA.created_at", "answered_at")
            ])
            .orderBy(BbsArticle.getColumn("created_at", null), "DESC");

        if (input !== null)
        {
            if (input.answered !== undefined)
            {
                const operator = input.answered 
                    ? "=" 
                    : "!=" as const;
                stmt.andWhere(...BbsAnswerArticle.getWhereArguments("base", operator, null));
            }
            BbsArticlesProvider.search(stmt, input);
        }
        return stmt;
    }
}