import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsManager } from "../../../../api/structures/bbs/actors/IBbsManager";

@nest.Controller("bbs/managers/authenticate")
export class BbsManagerAuthenticateController
{
    @helper.EncryptedRoute.Get()
    public async get
        (
            @nest.Request() request: express.Request
        ): Promise<IBbsManager>
    {
        request;

        return null!;
    }

    @helper.EncryptedRoute.Post("join")
    public async join
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsManager.IAuthorization.IJoin
        ): Promise<IBbsManager>
    {
        request;
        input;

        return null!;
    }

    @helper.EncryptedRoute.Post("login")
    public async login
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsManager.IAuthorization.ILogin
        ): Promise<IBbsManager>
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