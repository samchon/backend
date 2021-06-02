import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsManager } from "../../../../api/structures/bbs/actors/IBbsManager";

@nest.Controller("bbs/managers/authenticate/password")
export class BbsManagerAuthenticatePasswordController
{
    @nest.Patch("change")
     public async change
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsManager.IAuthorization.IChangePassword
        ): Promise<void>
    {
        request;
        input;
    }

    @nest.Patch("reset")
    public async reset
        (
            @helper.EncryptedBody() input: IBbsManager.IAuthorization.IResetPassword
        ): Promise<void>
    {
        input;
    }
}