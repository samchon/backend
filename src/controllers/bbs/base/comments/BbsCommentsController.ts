import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IPage } from "../../../../api/structures/common/IPage";
import { IBbsComment } from "../../../../api/structures/bbs/articles/IBbsComment";

export class BbsCommentsController
{
    @helper.EncryptedRoute.Get()
    public async index
        (
            @nest.Request() request: express.Request, 
            @helper.TypedParam("code", "string") code: string, 
            @helper.TypedParam("id", "string") id: string
        ): Promise<IPage<IBbsComment>>
    {
        request;
        code;
        id;

        return null!;
    }
}