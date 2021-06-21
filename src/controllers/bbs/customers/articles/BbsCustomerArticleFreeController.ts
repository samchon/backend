import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { assertType } from "typescript-is";

import { IBbsFreeArticle } from "../../../../api/structures/bbs/articles/IBbsFreeArticle";

import { BbsArticle } from "../../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsCustomer } from "../../../../models/tables/bbs/actors/BbsCustomer";
import { BbsFreeArticle } from "../../../../models/tables/bbs/articles/BbsFreeArticle";
import { BbsSection } from "../../../../models/tables/bbs/systematic/BbsSection";

import { BbsCustomerArticlesTrait } from "./BbsCustomerArticlesTrait";
import { BbsArticleFreeController } from "../../base/articles/BbsArticleFreeController";

import { BbsArticleContentProvider } from "../../../../providers/bbs/articles/BbsArticleContentProvider";
import { BbsFreeArticleProvider } from "../../../../providers/bbs/articles/BbsFreeArticleProvider";
import { BbsSectionProvider } from "../../../../providers/bbs/systematic/BbsSectionProvider";

@nest.Controller("bbs/customers/articles/free/:code")
export class BbsCustomerArticleFreeController
    extends BbsArticleFreeController<BbsCustomer, typeof BbsCustomerArticlesTrait>
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
            @helper.EncryptedBody() input: IBbsFreeArticle.IStore
        ): Promise<IBbsFreeArticle>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "free");
        const customer: BbsCustomer<true> = await this.trait.authorize(request, true);

        const free: BbsFreeArticle = await BbsFreeArticleProvider.store
        (
            section,
            customer,
            input
        );
        return await BbsFreeArticleProvider.json(free);
    }

    @helper.EncryptedRoute.Put(":id")
    public async update
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string,
            @helper.EncryptedBody() input: IBbsFreeArticle.IUpdate
        ): Promise<IBbsFreeArticle.IContent>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "free");
        const customer: BbsCustomer<true> = await this.trait.authorize(request, true);

        const free: BbsFreeArticle = await BbsFreeArticleProvider.editable(section, id, customer);
        const article: BbsArticle = await free.base.get();
        const content: BbsArticleContent = await BbsArticleContentProvider.update(article, input);

        return await BbsArticleContentProvider.json(content);
    }
}