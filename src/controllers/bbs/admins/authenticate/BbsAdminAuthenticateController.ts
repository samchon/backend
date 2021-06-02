import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsAdministrator } from "../../../../api/structures/bbs/actors/IBbsAdministrator";

@nest.Controller("bbs/admins/authenticate")
export class BbsAdminAuthenticateController
{
    @helper.EncryptedRoute.Get()
    public async get
        (
            @nest.Request() request: express.Request
        ): Promise<IBbsAdministrator>
    {
        request;

        return null!;
    }

    @helper.EncryptedRoute.Post("login")
    public async login
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsAdministrator.IAuthorization.ILogin
        ): Promise<IBbsAdministrator>
    {
        request;
        input;

        return null!;
    }

    @helper.EncryptedRoute.Get("refresh")
    public async refresh
        (
            @nest.Request() request: express.Request
        ): Promise<object>
    {
        request;

        return null!;
    }
}