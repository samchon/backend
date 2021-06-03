import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { IPointer } from "tstl/functional/IPointer";
import { assertType } from "typescript-is";

import { IBbsManager } from "../../../../api/structures/bbs/actors/IBbsManager";

import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";

import { BbsManagerAuth } from "./BbsManagerAuth";
import { BbsManagerProvider } from "../../../../providers/bbs/actors/BbsManagerProvider";

@nest.Controller("bbs/managers/authenticate")
export class BbsManagerAuthenticateController
{
    @helper.EncryptedRoute.Get()
    public async get
        (
            @nest.Request() request: express.Request
        ): Promise<IBbsManager>
    {
        const manager: BbsManager = await BbsManagerAuth.authorize(request, false);
        return await BbsManagerProvider.json(manager);
    }

    @helper.EncryptedRoute.Post("login")
    public async login
        (
            @helper.EncryptedBody() input: IBbsManager.IAuthorization.ILogin
        ): Promise<IBbsManager>
    {
        assertType<typeof input>(input);

        const manager: BbsManager = await BbsManagerProvider.login(input);

        return {
            ...await BbsManagerProvider.json(manager),
            ...BbsManagerAuth.issue(manager, true)
        };
    }

    @helper.EncryptedRoute.Get("refresh")
    public async refresh
        (
            @nest.Request() request: express.Request
        ): Promise<object>
    {
        const ptr: IPointer<boolean> = { value: false };
        const manager: BbsManager = await BbsManagerAuth.authorize(request, false, ptr);

        return BbsManagerAuth.issue(manager, ptr.value);
    }
}