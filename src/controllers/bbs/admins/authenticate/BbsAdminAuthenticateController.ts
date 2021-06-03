import express from "express";
import * as helper from "encrypted-nestjs";
import { assertType } from "typescript-is";
import * as nest from "@nestjs/common";

import { IBbsAdministrator } from "../../../../api/structures/bbs/actors/IBbsAdministrator";

import { BbsAdministrator } from "../../../../models/tables/bbs/actors/BbsAdministrator";

import { BbsAdminAuth } from "./BbsAdminAuth";
import { BbsAdminProvider } from "../../../../providers/bbs/actors/BbsAdminProvider";
import { MemberProvider } from "../../../../providers/members/MemberProvider";

@nest.Controller("bbs/admins/authenticate")
export class BbsAdminAuthenticateController
{
    @helper.EncryptedRoute.Get()
    public async get
        (
            @nest.Request() request: express.Request
        ): Promise<IBbsAdministrator>
    {
        const admin: BbsAdministrator = await BbsAdminAuth.authorize(request);
        return await MemberProvider.json(await admin.base.get());
    }

    @helper.EncryptedRoute.Post("login")
    public async login
        (
            @helper.EncryptedBody() input: IBbsAdministrator.IAuthorization.ILogin
        ): Promise<IBbsAdministrator>
    {
        assertType<typeof input>(input);

        const manager: BbsAdministrator = await BbsAdminProvider.login(input);

        return {
            ...await BbsAdminProvider.json(manager),
            ...BbsAdminAuth.issue(manager)
        };
    }

    @helper.EncryptedRoute.Get("refresh")
    public async refresh
        (
            @nest.Request() request: express.Request
        ): Promise<object>
    {
        const admin: BbsAdministrator = await BbsAdminAuth.authorize(request);
        return BbsAdminAuth.issue(admin);
    }
}