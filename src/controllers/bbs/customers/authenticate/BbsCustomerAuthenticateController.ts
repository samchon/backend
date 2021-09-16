import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { IPointer } from "tstl/functional/IPointer";
import { assertType } from "typescript-is";

import { IBbsCustomer } from "../../../../api/structures/bbs/actors/IBbsCustomer";
import { ICitizen } from "../../../../api/structures/members/ICitizen";
import { IMember } from "../../../../api/structures/members/IMember";

import { BbsCustomer } from "../../../../models/tables/bbs/actors/BbsCustomer";
import { Citizen } from "../../../../models/tables/members/Citizen";
import { Member } from "../../../../models/tables/members/Member";

import { BbsCustomerAuth } from "./BbsCustomerAuth";
import { BbsCustomerProvider } from "../../../../providers/bbs/actors/BbsCustomerProvider";
import { CitizenProvider } from "../../../../providers/members/CitizenProvider";
import { MemberProvider } from "../../../../providers/members/MemberProvider";

@nest.Controller("bbs/customers/authenticate")
export class BbsCustomerAuthenticateController
{
    @helper.EncryptedRoute.Get()
    public async get
        (
            @nest.Request() request: express.Request
        ): Promise<IBbsCustomer>
    {
        const { customer } = await BbsCustomerAuth.authorize(request, false, false);
        return await BbsCustomerProvider.json().getOne(customer);
    }

    @helper.EncryptedRoute.Patch("issue")
    public async issue
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsCustomer.IStore
        ): Promise<IBbsCustomer>
    {
        assertType<typeof input>(input);

        const customer: BbsCustomer = await BbsCustomerProvider.issue(input, request.ip);

        return {
            ...await BbsCustomerProvider.json().getOne(customer),
            ...BbsCustomerAuth.issue(customer, true)
        };
    }

    @helper.EncryptedRoute.Post("activate")
    public async activate
        (
            @nest.Request() request: express.Request, 
            @helper.EncryptedBody() input: ICitizen.IStore
        ): Promise<ICitizen>
    {
        assertType<typeof input>(input);

        const { customer } = await BbsCustomerAuth.authorize(request, false, true);
        const citizen: Citizen = await BbsCustomerProvider.activate(customer, input);

        return await CitizenProvider.json().getOne(citizen);
    }

    @helper.EncryptedRoute.Get("refresh")
    public async refresh
        (
            @nest.Request() request: express.Request
        ): Promise<object>
    {
        const ptr: IPointer<boolean> = { value: false };
        const { customer } = await BbsCustomerAuth.authorize(request, false, true);
        
        return BbsCustomerAuth.issue(customer, ptr.value);
    }

    @helper.EncryptedRoute.Post("join")
    public async join
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsCustomer.IAuthorization.IJoin
        ): Promise<IMember>
    {
        assertType<typeof input>(input);

        const { customer } = await BbsCustomerAuth.authorize(request, false, true);
        const member: Member = await BbsCustomerProvider.join(customer, input);

        return await MemberProvider.json().getOne(member);
    }

    @helper.EncryptedRoute.Post("login")
    public async login
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsCustomer.IAuthorization.ILogin
        ): Promise<IMember>
    {
        assertType<typeof input>(input);

        const { customer } = await BbsCustomerAuth.authorize(request, false, true);
        const member: Member = await BbsCustomerProvider.login(customer, input);

        return await MemberProvider.json().getOne(member);
    }
}