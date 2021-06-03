import * as express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { assertType } from "typescript-is"

import { IBbsReviewArticle } from "../../../../api/structures/bbs/articles/IBbsReviewArticle";
import { IPage } from "../../../../api/structures/common/IPage";

import { BbsReviewArticle } from "../../../../models/tables/bbs/articles/BbsReviewArticle";
import { BbsSection } from "../../../../models/tables/bbs/systematics/BbsSection";

import { IBbsArticlesTrait } from "./IBbsArticlesTrait";
import { BbsReviewArticleProvider } from "../../../../providers/bbs/articles/BbsReviewArticleProvider";
import { BbsSectionProvider } from "../../../../providers/bbs/systematics/BbsSectionProvider";
import { Paginator } from "../../../../utils/Paginator";

export abstract class BbsArticleReviewsController<
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
            @helper.EncryptedBody() input: IBbsReviewArticle.IRequest
        ): Promise<IPage<IBbsReviewArticle.ISummary>>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "REVIEW");
        await this.trait.authorize(request, false, section);

        const stmt = BbsReviewArticleProvider.statement(section, input.search);
        return await Paginator.paginate(stmt, input, BbsReviewArticleProvider.postProcess);
    }

    @helper.EncryptedRoute.Get(":id")
    public async at
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string
        ): Promise<IBbsReviewArticle>
    {
        const section: BbsSection = await BbsSectionProvider.find(code, "REVIEW");
        await this.trait.authorize(request, false, section);

        const review: BbsReviewArticle = await BbsReviewArticleProvider.find(section, id);
        return await BbsReviewArticleProvider.json(review);
    }
}