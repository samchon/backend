import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsQuestionArticle } from "../../../../api/structures/bbs/articles/IBbsQuestionArticle";
import { IPage } from "../../../../api/structures/common/IPage";

export class BbsArticleQuestionsController
{
    @helper.EncryptedRoute.Patch()
    public async index
        (
            @nest.Request() request: express.Request, 
            @helper.TypedParam("code", "string") code: string, 
            @helper.EncryptedBody() input: IBbsQuestionArticle.IRequest
        ): Promise<IPage<IBbsQuestionArticle.ISummary>>
    {
        request;
        code;
        input;

        return null!;
    }

    @helper.EncryptedRoute.Get(":id")
    public async at
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string
        ): Promise<IBbsQuestionArticle>
    {
        request;
        code;
        id;

        return null!;
    }
}