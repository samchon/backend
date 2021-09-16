import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { BbsArticleQuestionsController } from "../../base/articles/BbsArticleQuestionsController";
import { IBbsQuestionArticle } from "../../../../api/structures/bbs/articles/IBbsQuestionArticle";
import { BbsCustomer } from "../../../../models/tables/bbs/actors/BbsCustomer";
import { BbsCustomerArticlesTrait } from "./BbsCustomerArticlesTrait";
import { BbsQuestionArticle } from "../../../../models/tables/bbs/articles/BbsQuestionArticle";
import { BbsQuestionArticleProvider } from "../../../../providers/bbs/articles/BbsQuestionArticleProvider";
import { BbsSectionProvider } from "../../../../providers/bbs/systematic/BbsSectionProvider";
import { BbsSection } from "../../../../models/tables/bbs/systematic/BbsSection";
import { assertType } from "typescript-is";
import { BbsArticle } from "../../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsArticleContentProvider } from "../../../../providers/bbs/articles/BbsArticleContentProvider";

@nest.Controller("bbs/customers/articles/questions/:code")
export class BbsCustomerArticleQuestionsController
    extends BbsArticleQuestionsController<BbsCustomer, typeof BbsCustomerArticlesTrait>
{
    public constructor()
    {
        super(BbsCustomerArticlesTrait);
    }

    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsQuestionArticle.IStore
        ): Promise<IBbsQuestionArticle>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "qna");
        const customer: BbsCustomer<true> = await this.trait.authorize(request, true);

        const question: BbsQuestionArticle = await BbsQuestionArticleProvider.store
        (
            section,
            customer,
            input
        );
        return await BbsQuestionArticleProvider.json().getOne(question);
    }

    @helper.EncryptedRoute.Put(":id")
    public async update
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string,
            @helper.EncryptedBody() input: IBbsQuestionArticle.IUpdate
        ): Promise<IBbsQuestionArticle.IContent>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "qna");
        const customer: BbsCustomer<true> = await this.trait.authorize(request, true);

        const question: BbsQuestionArticle = await BbsQuestionArticleProvider.editable(section, id, customer);
        const article: BbsArticle = await question.base.get();
        const content: BbsArticleContent = await BbsArticleContentProvider.update(article, input);

        return await BbsArticleContentProvider.json().getOne(content);
    }
}