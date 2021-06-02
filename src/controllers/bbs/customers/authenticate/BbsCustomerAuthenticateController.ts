import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsCustomer } from "../../../../api/structures/bbs/actors/IBbsCustomer";
import { ICitizen } from "../../../../api/structures/members/ICitizen";
import { IMember } from "../../../../api/structures/members/IMember";

@nest.Controller("bbs/customers/authenticate")
export class BbsCustomerAuthenticateController
{
    @helper.EncryptedRoute.Get()
    public async get
        (
            @nest.Request() request: express.Request
        ): Promise<IBbsCustomer>
    {
        request;

        return null!;
    }

    @helper.EncryptedRoute.Patch("issue")
    public async issue
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsCustomer.IStore
        ): Promise<IBbsCustomer>
    {
        request;
        input;

        return null!;
    }

    @helper.EncryptedRoute.Post("activate")
    public async activate
        (
            @nest.Request() request: express.Request, 
            @helper.EncryptedBody() input: ICitizen.IStore
        ): Promise<ICitizen>
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

    @helper.EncryptedRoute.Post("join")
    public async join
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsCustomer.IAuthorization.IJoin
        ): Promise<IMember>
    {
        request;
        input;

        return null!;
    }

    @helper.EncryptedRoute.Post("login")
    public async login
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsCustomer.IAuthorization.ILogin
        ): Promise<IMember>
    {
        request;
        input;

        return null!;
    }
}