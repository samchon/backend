import * as express from "express";

import { BbsCustomer } from "../../../../models/tables/bbs/actors/BbsCustomer";
import { BbsCustomerAuth } from "../authenticate/BbsCustomerAuth";

export namespace BbsCustomerArticlesTrait
{
    export async function authorize<Write extends boolean>
        (
            request: express.Request, 
            write: Write
        ): Promise<BbsCustomer<Write>>
    {
        const { customer } = await BbsCustomerAuth.authorize(request, write, write);
        return customer;
    }
};