import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { assertType } from "typescript-is";

import { IBbsComment } from "../../../../api/structures/bbs/articles/IBbsComment";

import { BbsArticle } from "../../../../models/tables/bbs/articles/BbsArticle";
import { BbsComment } from "../../../../models/tables/bbs/articles/BbsComment";
import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";

import { BbsCommentsController } from "../../base/articles/BbsCommentsController";
import { BbsCommentProvider } from "../../../../providers/bbs/articles/BbsCommentProvider";
import { BbsManagerAuth } from "../authenticate/BbsManagerAuth";

@nest.Controller("bbs/managers/articles/:type/:code/:id/comments")
export class BbsManagerCommentsController extends BbsCommentsController
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

        const manager: BbsManager = await BbsManagerAuth.authorize(request, true);
        
        const article: BbsArticle = await this._Find_article(type, code, id);
        const comment: BbsComment = await BbsCommentProvider.store(article, manager, input);

        return await BbsCommentProvider.json(comment);
    }
}