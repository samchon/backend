import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { assertType } from "typescript-is";

import { IBbsCustomer } from "../../../../api/structures/bbs/actors/IBbsCustomer";

import { Member } from "../../../../models/tables/members/Member";

import { BbsCustomerAuth } from "./BbsCustomerAuth";
import { MemberProvider } from "../../../../providers/members/MemberProvider";

@nest.Controller("bbs/customers/authenticate/password")
export class BbsCustomerAuthenticatePasswordController
{
    @nest.Put("change")
     public async change
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsCustomer.IAuthorization.IChangePassword
        ): Promise<void>
    {
        assertType<typeof input>(input);

        const { customer } = await BbsCustomerAuth.authorize(request, false, true);
        const member: Member | null = await customer.member.get();

        if (member === null)
             throw new nest.ForbiddenException("You've not joined as a member yet.");

        await MemberProvider.changePassword(member, input);
    }

    @nest.Put("reset")
    public async reset
        (
            @helper.EncryptedBody() input: IBbsCustomer.IAuthorization.IResetPassword
        ): Promise<void>
    {
        assertType<typeof input>(input);
        await MemberProvider.resetPassword(input);
    }
}