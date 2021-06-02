import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { BbsArticleQuestionsController } from "../../base/articles/BbsArticleQuestionsController";
import { IBbsQuestionArticle } from "../../../../api/structures/bbs/articles/IBbsQuestionArticle";

@nest.Controller("bbs/customers/articles/questions/:code")
export class BbsCustomerArticleQuestionsController
    extends BbsArticleQuestionsController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsQuestionArticle.IStore
        ): Promise<IBbsQuestionArticle>
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
            @helper.EncryptedBody() input: IBbsQuestionArticle.IUpdate
        ): Promise<IBbsQuestionArticle.IContent>
    {
        request;
        code;
        id;
        input;

        return null!;
    }
}