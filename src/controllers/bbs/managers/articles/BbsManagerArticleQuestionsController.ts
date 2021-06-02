import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { BbsArticleQuestionsController } from "../../base/articles/BbsArticleQuestionsController";

import { IBbsAnswerArticle } from "../../../../api/structures/bbs/articles/IBbsAnswerArticle";

@nest.Controller("bbs/managers/articles/questions/:code")
export class BbsManagerArticleQuestionsController
    extends BbsArticleQuestionsController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsAnswerArticle.IStore
        ): Promise<IBbsAnswerArticle>
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
            @helper.EncryptedBody() input: IBbsAnswerArticle.IUpdate
        ): Promise<IBbsAnswerArticle.IContent>
    {
        request;
        code;
        id;
        input;

        return null!;
    }
}