import * as nest from "@nestjs/common";
import safe from "safe-typeorm";

import { IBbsAnswerArticle } from "../../../api/structures/bbs/articles/IBbsAnswerArticle";

import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsAnswerArticle } from "../../../models/tables/bbs/articles/BbsAnswerArticle";
import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsSection } from "../../../models/tables/bbs/systematic/BbsSection";

import { BbsArticleProvider } from "./BbsArticleProvider";
import { BbsArticleContentProvider } from "./BbsArticleContentProvider";
import { BbsQuestionArticle } from "../../../models/tables/bbs/articles/BbsQuestionArticle";
import { Singleton } from "tstl/thread/Singleton";
import { BbsManagerProvider } from "../actors/BbsManagerProvider";

export namespace BbsAnswerArticleProvider
{
    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export function json(): safe.JsonSelectBuilder<BbsAnswerArticle, any, IBbsAnswerArticle>
    {
        return json_builder.get();
    }

    const json_builder = new Singleton(() => safe.createJsonSelectBuilder
    (
        BbsAnswerArticle,
        {
            base: BbsArticleProvider.json(),
            manager: BbsManagerProvider.reference(),
            question: undefined,
        },
        output => ({
            ...output,
            ...output.base,
            base: undefined
        })
    ));

    export async function editable
        (
            section: BbsSection, 
            id: string, 
            manager: BbsManager
        ): Promise<BbsAnswerArticle>
    {
        const answer: BbsAnswerArticle = await BbsAnswerArticle
            .createJoinQueryBuilder(answer => answer.innerJoin("base"))
            .andWhere(...BbsArticle.getWhereArguments("section", section))
            .andWhere(...BbsAnswerArticle.getWhereArguments("question", id))
            .getOneOrFail();
        if (answer.manager.id !== manager.base.id)
            throw new nest.ForbiddenException("This article is not yours.");

        return answer;
    }

    /* ----------------------------------------------------------------
        SAVE
    ---------------------------------------------------------------- */
    export function collect
        (
            collection: safe.InsertCollection,
            section: BbsSection,
            question: BbsQuestionArticle,
            manager: BbsManager,
            input: IBbsAnswerArticle.IStore
        ): BbsAnswerArticle
    {
        const base: BbsArticle = BbsArticleProvider.collect
        (
            collection, 
            section, 
            input,
            BbsArticleContentProvider.collect,
            false
        );

        const answer: BbsAnswerArticle = BbsAnswerArticle.initialize({
            base,
            question,
            manager
        });
        base.answer.set(answer);
        question.answer.set(answer);

        collection.push(answer);
        return answer;
    }

    export async function store
        (
            section: BbsSection,
            question: BbsQuestionArticle,
            manager: BbsManager,
            input: IBbsAnswerArticle.IStore
        ): Promise<BbsAnswerArticle>
    {
        if (await question.answer.get() !== null)
            throw new nest.UnprocessableEntityException("Already being answered.");

        const collection: safe.InsertCollection = new safe.InsertCollection();
        const answer: BbsAnswerArticle = collect
        (
            collection, 
            section, 
            question, 
            manager, 
            input
        );
        
        await collection.execute();
        return answer;
    }
}