import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsManager } from "../../../../api/structures/bbs/actors/IBbsManager";

import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";
import { Member } from "../../../../models/tables/members/Member";

import { BbsManagerAuth } from "./BbsManagerAuth";
import { MemberProvider } from "../../../../providers/members/MemberProvider";

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
        const manager: BbsManager = await BbsManagerAuth.authorize(request, true);
        const base: Member = await manager.base.get();

        await MemberProvider.changePassword(base, input);
    }

    @nest.Patch("reset")
    public async reset
        (
            @helper.EncryptedBody() input: IBbsManager.IAuthorization.IResetPassword
        ): Promise<void>
    {
        await MemberProvider.resetPassword(input);        
    }
}