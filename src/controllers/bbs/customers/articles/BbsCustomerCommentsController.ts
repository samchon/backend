import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { assertType } from "typescript-is";

import { IBbsComment } from "../../../../api/structures/bbs/articles/IBbsComment";

import { BbsArticle } from "../../../../models/tables/bbs/articles/BbsArticle";
import { BbsComment } from "../../../../models/tables/bbs/articles/BbsComment";

import { BbsCommentsController } from "../../base/articles/BbsCommentsController";
import { BbsCommentProvider } from "../../../../providers/bbs/articles/BbsCommentProvider";
import { BbsCustomerAuth } from "../authenticate/BbsCustomerAuth";

@nest.Controller("bbs/customers/articles/:type/:code/:id/comments")
export class BbsCustomerCommentsController extends BbsCommentsController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("type", "string") type: string,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string,
            @helper.EncryptedBody() input: IBbsComment.IStore
        ): Promise<IBbsComment>
    {
        assertType<typeof input>(input);

        const { customer } = await BbsCustomerAuth.authorize(request, true, true);
        
        const article: BbsArticle = await this._Find_article(type, code, id);
        const comment: BbsComment = await BbsCommentProvider.store(article, customer, input);

        return await BbsCommentProvider.json(comment);
    }
}