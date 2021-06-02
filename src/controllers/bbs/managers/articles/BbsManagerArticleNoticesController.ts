import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { BbsArticleNoticesController } from "../../base/articles/BbsArticleNoticesController";

import { IBbsNoticeArticle } from "../../../../api/structures/bbs/articles/IBbsNoticeArticle";

@nest.Controller("bbs/managers/articles/notices/:code")
export class BbsManagerArticleNoticesController
    extends BbsArticleNoticesController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsNoticeArticle.IStore
        ): Promise<IBbsNoticeArticle>
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
            @helper.EncryptedBody() input: IBbsNoticeArticle.IUpdate
        ): Promise<IBbsNoticeArticle.IContent>
    {
        request;
        code;
        id;
        input;

        return null!;
    }
}