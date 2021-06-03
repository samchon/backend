import * as nest from "@nestjs/common";
import * as orm from "typeorm";
import safe from "safe-typeorm";

import { AesPkcs5 } from "../../../api/__internal/AesPkcs5";
import { IBbsAnswerArticle } from "../../../api/structures/bbs/articles/IBbsAnswerArticle";
import { IBbsQuestionArticle } from "../../../api/structures/bbs/articles/IBbsQuestionArticle";

import { BbsAnswerArticle } from "../../../models/tables/bbs/articles/BbsAnswerArticle";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsCustomer } from "../../../models/tables/bbs/actors/BbsCustomer";
import { BbsQuestionArticle } from "../../../models/tables/bbs/articles/BbsQuestionArticle";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { Citizen } from "../../../models/tables/members/Citizen";
import { __MvBbsArticleHit } from "../../../models/material/bbs/__MvBbsArticleHit";

import { BbsAnswerArticleProvider } from "./BbsAnswerArticleProvider";
import { BbsArticleProvider } from "./BbsArticleProvider";
import { BbsArticleContentProvider } from "./BbsArticleContentProvider";
import { BbsCustomerProvider } from "../actors/BbsCustomerProvider";

export namespace BbsQuestionArticleProvider
{
    /* ----------------------------------------------------------------
        INDEX
    ---------------------------------------------------------------- */
    export function statement
        (
            section: BbsSection, 
            input: IBbsQuestionArticle.IRequest.ISearch | null
        ): orm.SelectQueryBuilder<BbsQuestionArticle>
    {
        const stmt: orm.SelectQueryBuilder<BbsQuestionArticle> = BbsQuestionArticle
            .createJoinQueryBuilder(review =>
            {
                review.leftJoin("answer", answer =>
                {
                    answer.leftJoin("manager")
                        .leftJoin("base")
                        .leftJoin("citizen", "ACitizen");
                    answer.leftJoin("base", "ABase")
                        .leftJoin("__mv_last", "ALast")
                        .leftJoin("content", "AContent")
                });
                review.innerJoin("customer")
                    .innerJoin("citizen");
                review.innerJoin("base", article =>
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
                BbsArticleContent.getColumn("title"),
                BbsArticle.getColumn("created_at"),
                BbsArticleContent.getColumn("created_at", "updated_at"),
                Citizen.getColumn("ACitizen.name", "answer_manager"),
                BbsArticleContent.getColumn("AContent.title", "answer_title"),
                BbsArticle.getColumn("ABase.created_at", "answer_created_at"),
                BbsArticleContent.getColumn("AContent.created_at", "updated_at"),
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
            BbsArticleProvider.search(stmt, input);
        }
        return stmt;
    }
    export namespace statement
    {
        export interface IRaw extends Omit<IBbsQuestionArticle.ISummary, "answer">
        {
            answer_manager: string | null;
            answer_title: string | null;
            answer_created_at: string | null;
            answer_updated_at: string | null;
        }
    }

    export function postProcess(inputList: statement.IRaw[]): IBbsQuestionArticle.ISummary[]
    {
        return inputList.map(input =>
        {
            let answer: IBbsAnswerArticle.ISummary | null = null;
            if (input.answer_manager !== null)
            {
                answer = {
                    manager: AesPkcs5.decode(input.answer_manager!,
                        Citizen.ENCRYPTION_PASSWORD.key,
                        Citizen.ENCRYPTION_PASSWORD.iv
                    ),
                    title: input.answer_title!,
                    created_at: input.answer_created_at!,
                    updated_at: input.answer_updated_at
                };
                delete (input as Partial<statement.IRaw>).answer_manager;
                delete (input as Partial<statement.IRaw>).answer_title;
                delete (input as Partial<statement.IRaw>).answer_created_at;
                delete (input as Partial<statement.IRaw>).answer_updated_at;
            }
            return {
                ...input,
                customer: AesPkcs5.decode(input.customer, 
                    Citizen.ENCRYPTION_PASSWORD.key,
                    Citizen.ENCRYPTION_PASSWORD.iv
                ),
                answer
            };
        })
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export async function find(section: BbsSection, id: string): Promise<BbsQuestionArticle>
    {
        return await BbsQuestionArticle
            .createJoinQueryBuilder(question => 
            {
                question.innerJoinAndSelect("customer")
                    .innerJoinAndSelect("citizen");
                question.innerJoinAndSelect("base");
                question.leftJoinAndSelect("answer", answer =>
                {
                    answer.leftJoinAndSelect("manager")
                        .leftJoinAndSelect("base")
                        .leftJoinAndSelect("citizen", "ACitizen");
                    answer.leftJoin("base", "ABase");
                });
            })
            .andWhere(...BbsArticle.getWhereArguments("section", "=", section))
            .andWhere(...BbsArticle.getWhereArguments("id", "=", id))
            .getOneOrFail();
    }

    export async function editable
        (
            section: BbsSection, 
            id: string, 
            customer: BbsCustomer<true>
        ): Promise<BbsQuestionArticle>
    {
        // GET ARTICLE
        const question: BbsQuestionArticle = await find(section, id);

        // VALIDATE OWNERSHIP
        const writer: Citizen = await (await question.customer.get()).citizen.get();
        const accessor: Citizen = await customer.citizen.get();

        if (writer.id !== accessor.id)
            throw new nest.ForbiddenException("This article is not yours.");

        return question;
    }

    export async function json(question: BbsQuestionArticle): Promise<IBbsQuestionArticle>
    {
        const base: BbsArticle = await question.base.get();
        const customer: BbsCustomer<true> = await question.customer.get();
        const answer: BbsAnswerArticle | null = await question.answer.get();
        const hit: __MvBbsArticleHit | null = await base.__mv_hit.get();

        return {
            ...await BbsArticleProvider.json
            (
                base,
                BbsArticleContentProvider.json
            ),
            customer: await BbsCustomerProvider.json(customer),
            answer: (answer !== null)
                ? await BbsAnswerArticleProvider.json(answer)
                : null,
            hit: hit !== null
                ? hit.count
                : 0
        };
    }

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export function collect
        (
            collection: safe.InsertCollection,
            section: BbsSection, 
            customer: BbsCustomer<true>,
            input: IBbsQuestionArticle.IStore
        ): BbsQuestionArticle
    {
        // SUPER-TYPE
        const base: BbsArticle = BbsArticleProvider.collect
        (
            collection,
            section,
            input,
            BbsArticleContentProvider.collect,
            true
        );

        // SUB-TYPE
        const question: BbsQuestionArticle = BbsQuestionArticle.initialize({
            base,
            customer
        });
        base.question.set(collection.push(question));

        return question;
    }

    export async function store
        (
            section: BbsSection, 
            customer: BbsCustomer<true>,
            input: IBbsQuestionArticle.IStore
        ): Promise<BbsQuestionArticle>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const question: BbsQuestionArticle = collect(collection, section, customer, input);
        
        await collection.execute();
        return question;
    }
}