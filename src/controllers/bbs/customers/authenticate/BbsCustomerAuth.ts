import express from "express";
import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { IPointer } from "tstl/functional/IPointer";

import { ActorAuth } from "../../base/authenticate/ActorAuth";
import { BbsCustomer } from "../../../../models/tables/bbs/actors/BbsCustomer";
import { Citizen } from "../../../../models/tables/members/Citizen";

export namespace BbsCustomerAuth
{
    export async function authorize<Ensure extends boolean>
        (
            request: express.Request,
            mustBeCitizen: Ensure,
            requiresWritable: boolean,
            isWritablePtr?: IPointer<boolean>
        ): Promise<IAuthorized<Ensure>>
    {
        const customer: BbsCustomer<Ensure> = await ActorAuth.authorize
        (
            BbsCustomer as safe.Model.Creator<BbsCustomer<Ensure>>, 
            HEADER_KEY, 
            request, 
            requiresWritable, 
            isWritablePtr
        );
        if (mustBeCitizen === true && customer.citizen.id === null)
            throw new nest.ForbiddenException("You're a type of consumer, however, you've not been certified as a citizen yet.");

        const citizen: Citizen | null = await customer.citizen.get();
        return { customer, citizen } as IAuthorized<Ensure>;
    }

    export function issue(instance: BbsCustomer, writable: boolean)
    {
        return ActorAuth.issue
        (
            instance, 
            elem => elem.id, 
            HEADER_KEY, 
            writable
        );
    }

    export interface IAuthorized<Ensure extends boolean>
    {
        customer: BbsCustomer<Ensure>;
        citizen: Citizen;
    }

    const HEADER_KEY = "bbs-customer-authorization";
}