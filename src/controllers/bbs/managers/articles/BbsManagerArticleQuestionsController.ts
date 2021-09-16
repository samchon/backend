import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { assertType } from "typescript-is";

import { IBbsAnswerArticle } from "../../../../api/structures/bbs/articles/IBbsAnswerArticle";

import { BbsArticle } from "../../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsAnswerArticle } from "../../../../models/tables/bbs/articles/BbsAnswerArticle";
import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";
import { BbsQuestionArticle } from "../../../../models/tables/bbs/articles/BbsQuestionArticle";
import { BbsSection } from "../../../../models/tables/bbs/systematic/BbsSection";

import { BbsAnswerArticleProvider } from "../../../../providers/bbs/articles/BbsAnswerArticleProvider";
import { BbsArticleContentProvider } from "../../../../providers/bbs/articles/BbsArticleContentProvider";
import { BbsArticleQuestionsController } from "../../base/articles/BbsArticleQuestionsController";
import { BbsManagerArticlesTrait } from "./BbsManagerArticlesTrait";
import { BbsQuestionArticleProvider } from "../../../../providers/bbs/articles/BbsQuestionArticleProvider";
import { BbsSectionProvider } from "../../../../providers/bbs/systematic/BbsSectionProvider";

@nest.Controller("bbs/managers/articles/questions/:code")
export class BbsManagerArticleQuestionsController
    extends BbsArticleQuestionsController<BbsManager, typeof BbsManagerArticlesTrait>
{
    public constructor()
    {
        super(BbsManagerArticlesTrait);
    }

    @helper.EncryptedRoute.Post(":id")
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string,
            @helper.EncryptedBody() input: IBbsAnswerArticle.IStore
        ): Promise<IBbsAnswerArticle>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "qna");
        const manager: BbsManager = await this.trait.authorize(request, true, section);

        const question: BbsQuestionArticle = await BbsQuestionArticleProvider.find(section, id);
        const answer: BbsAnswerArticle = await BbsAnswerArticleProvider.store
        (
            section,
            question,
            manager,
            input
        );
        return await BbsAnswerArticleProvider.json().getOne(answer);
    }

    @helper.EncryptedRoute.Put(":id")
    public async update
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string,
            @helper.EncryptedBody() input: IBbsAnswerArticle.IUpdate
        ): Promise<IBbsAnswerArticle.IContent>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "qna");
        const manager: BbsManager = await this.trait.authorize(request, true, section);

        const answer: BbsAnswerArticle = await BbsAnswerArticleProvider.editable
        (
            section,
            id,
            manager
        );
        const article: BbsArticle = await answer.base.get();
        const content: BbsArticleContent = await BbsArticleContentProvider.update(article, input);

        return await BbsArticleContentProvider.json().getOne(content);
    }
}