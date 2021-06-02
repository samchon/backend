import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { BbsArticleFreeController } from "../../base/articles/BbsArticleFreeController";
import { IBbsFreeArticle } from "../../../../api/structures/bbs/articles/IBbsFreeArticle";

@nest.Controller("bbs/customers/articles/free/:code")
export class BbsCustomerArticleFreeController
    extends BbsArticleFreeController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsFreeArticle.IStore
        ): Promise<IBbsFreeArticle>
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
            @helper.EncryptedBody() input: IBbsFreeArticle.IUpdate
        ): Promise<IBbsFreeArticle.IContent>
    {
        request;
        code;
        id;
        input;

        return null!;
    }
}