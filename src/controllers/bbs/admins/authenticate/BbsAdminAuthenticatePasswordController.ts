import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsAdministrator } from "../../../../api/structures/bbs/actors/IBbsAdministrator";

@nest.Controller("bbs/admins/authenticate/password")
export class BbsAdminAuthenticatePasswordController
{
    @nest.Patch("change")
     public async change
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsAdministrator.IAuthorization.IChangePassword
        ): Promise<void>
    {
        request;
        input;
    }

    @nest.Patch("reset")
    public async reset
        (
            @helper.EncryptedBody() input: IBbsAdministrator.IAuthorization.IResetPassword
        ): Promise<void>
    {
        input;
    }
}