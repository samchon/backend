import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { BbsArticleReviewsController } from "../../base/articles/BbsArticleReviewsController";
import { IBbsReviewArticle } from "../../../../api/structures/bbs/articles/IBbsReviewArticle";

@nest.Controller("bbs/customers/articles/reviews/:code")
export class BbsCustomerArticleReviewsController
    extends BbsArticleReviewsController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsReviewArticle.IStore
        ): Promise<IBbsReviewArticle>
    {
        request;
        code;
        input;

        return null!;
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
        request;
        code;
        id;
        input;

        return null!;
    }
}