import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { assertType } from "typescript-is";

import { IBbsReviewArticle } from "../../../../api/structures/bbs/articles/IBbsReviewArticle";

import { BbsArticle } from "../../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsCustomer } from "../../../../models/tables/bbs/actors/BbsCustomer";
import { BbsSection } from "../../../../models/tables/bbs/systematic/BbsSection";
import { BbsReviewArticle } from "../../../../models/tables/bbs/articles/BbsReviewArticle";

import { BbsArticleReviewsController } from "../../base/articles/BbsArticleReviewsController";
import { BbsCustomerArticlesTrait } from "./BbsCustomerArticlesTrait";
import { BbsReviewArticleProvider } from "../../../../providers/bbs/articles/BbsReviewArticleProvider";
import { BbsReviewArticleContentProvider } from "../../../../providers/bbs/articles/BbsReviewArticleContentProvider";
import { BbsSectionProvider } from "../../../../providers/bbs/systematic/BbsSectionProvider";
import { BbsReviewArticleContent } from "../../../../models/tables/bbs/articles/BbsReviewArticleContent";

@nest.Controller("bbs/customers/articles/reviews/:code")
export class BbsCustomerArticleReviewsController
    extends BbsArticleReviewsController<BbsCustomer, typeof BbsCustomerArticlesTrait>
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
            @helper.EncryptedBody() input: IBbsReviewArticle.IStore
        ): Promise<IBbsReviewArticle>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "review");
        const customer: BbsCustomer<true> = await this.trait.authorize(request, true);

        const review: BbsReviewArticle = await BbsReviewArticleProvider.store
        (
            section,
            customer,
            input
        );
        return await BbsReviewArticleProvider.json().getOne(review);
    }

    @helper.EncryptedRoute.Put(":id")
    public async update
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string,
            @helper.EncryptedBody() input: IBbsReviewArticle.IUpdate
        ): Promise<IBbsReviewArticle.IContent>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "review");
        const customer: BbsCustomer<true> = await this.trait.authorize(request, true);

        const review: BbsReviewArticle = await BbsReviewArticleProvider.editable(section, id, customer);
        const article: BbsArticle = await review.base.get();
        const content: BbsArticleContent = await BbsReviewArticleContentProvider.update(article, input);
        const reviewContent: BbsReviewArticleContent = (await content.reviewContent.get())!;

        return await BbsReviewArticleContentProvider.json().getOne(reviewContent);
    }
}