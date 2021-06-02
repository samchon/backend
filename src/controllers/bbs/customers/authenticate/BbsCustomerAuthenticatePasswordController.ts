import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsCustomer } from "../../../../api/structures/bbs/actors/IBbsCustomer";

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
        request;
        input;
    }

    @nest.Put("reset")
    public async reset
        (
            @helper.EncryptedBody() input: IBbsCustomer.IAuthorization.IResetPassword
        ): Promise<void>
    {
        input;
    }
}