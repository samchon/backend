import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { assertType } from "typescript-is";

import { IBbsQuestionArticle } from "../../../../api/structures/bbs/articles/IBbsQuestionArticle";
import { IPage } from "../../../../api/structures/common/IPage";

import { BbsSection } from "../../../../models/tables/bbs/systematic/BbsSection";
import { BbsQuestionArticle } from "../../../../models/tables/bbs/articles/BbsQuestionArticle";

import { IBbsArticlesTrait } from "./IBbsArticlesTrait";
import { BbsQuestionArticleProvider } from "../../../../providers/bbs/articles/BbsQuestionArticleProvider";
import { BbsSectionProvider } from "../../../../providers/bbs/systematic/BbsSectionProvider";
import { Paginator } from "../../../../utils/Paginator";

export abstract class BbsArticleQuestionsController<
        Actor extends safe.Model, 
        Trait extends IBbsArticlesTrait<Actor>>
{
    protected constructor(protected readonly trait: Trait)
    {
    }

    @helper.EncryptedRoute.Patch()
    public async index
        (
            @nest.Request() request: express.Request, 
            @helper.TypedParam("code", "string") code: string, 
            @helper.EncryptedBody() input: IBbsQuestionArticle.IRequest
        ): Promise<IPage<IBbsQuestionArticle.ISummary>>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "qna");
        await this.trait.authorize(request, false, section);

        const stmt = BbsQuestionArticleProvider.statement(section, input.search);
        return await Paginator.paginate(stmt, input, BbsQuestionArticleProvider.postProcess);
    }

    @helper.EncryptedRoute.Get(":id")
    public async at
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string
        ): Promise<IBbsQuestionArticle>
    {
        const section: BbsSection = await BbsSectionProvider.find(code, "qna");
        await this.trait.authorize(request, false, section);

        const question: BbsQuestionArticle = await BbsQuestionArticleProvider.find(section, id);
        return await BbsQuestionArticleProvider.json(question);
    }
}