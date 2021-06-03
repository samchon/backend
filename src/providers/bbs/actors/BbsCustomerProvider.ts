import * as nest from "@nestjs/common";
import * as orm from "typeorm";
import safe from "safe-typeorm";
import { IBbsCustomer } from "../../../api/structures/bbs/actors/IBbsCustomer";
import { ICitizen } from "../../../api/structures/members/ICitizen";

import { BbsCustomer } from "../../../models/tables/bbs/actors/BbsCustomer";
import { Citizen } from "../../../models/tables/members/Citizen";
import { Member } from "../../../models/tables/members/Member";

import { CitizenProvider } from "../../members/CitizenProvider";
import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsCustomerProvider
{
    /* ----------------------------------------------------------------
        ACCECSSORS
    ---------------------------------------------------------------- */
    export async function json<Ensure extends boolean>
        (customer: BbsCustomer<Ensure>): Promise<IBbsCustomer<Ensure>>
    {
        const citizen: Citizen | null = await customer.citizen.get();
        const member: Member | null = await customer.member.get();

        return {
            ...customer.toPrimitive(),
            citizen: citizen !== null
                ? await CitizenProvider.json(citizen)
                : null as any,
            member: member !== null
                ? await MemberProvider.json(member)
                : null,
        } as any;
    }

    /* ----------------------------------------------------------------
        AUTHORIZATIONS
    ---------------------------------------------------------------- */
    export async function issue
        (
            input: IBbsCustomer.IStore, 
            ip: string
        ): Promise<BbsCustomer>
    {
        const customer: BbsCustomer = BbsCustomer.initialize({
            id: safe.DEFAULT,
            citizen: null as any,
            member: null,
            href: input.href,
            referrer: input.referrer,
            ip,
            created_at: safe.DEFAULT
        });
        return await customer.save();
    }

    export async function activate
        (
            customer: BbsCustomer,
            input: ICitizen.IStore
        ): Promise<Citizen>
    {
        if (customer.member.id !== null)
            throw new nest.UnprocessableEntityException("You've already activated as a member.");
        else if (customer.citizen.id !== null)
            throw new nest.UnprocessableEntityException("You've already activated as a citizen.");

        const collection: safe.InsertCollection = new safe.InsertCollection();
        const citizen: Citizen = await CitizenProvider.collect(collection, input);
        customer.citizen.set(citizen);

        collection.after(manager => customer.update(manager));
        await collection.execute();

        return citizen;
    }
    
    export async function join
        (
            customer: BbsCustomer,
            input: IBbsCustomer.IAuthorization.IJoin
        ): Promise<Member>
    {
        // HAVE ACTIVATED?
        if (customer.member.id !== null)
            throw new nest.ForbiddenException("You've already joined as a member.");
        else if (customer.citizen.id !== null)
        {
            const citizen: Citizen = (await customer.citizen.get())!;
            if (citizen.name !== input.citizen.name || citizen.mobile !== input.citizen.mobile)
                throw new nest.ForbiddenException("You've already activated as a different citizen.")
        }

        // COLLECT INSERTION
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const member: Member = await MemberProvider.collect(collection, input);
        collection.after(manager => assign(manager, customer, member));

        // DO INSERT
        await collection.execute();
        return member;
    }

    export async function login
        (
            customer: BbsCustomer,
            input: IBbsCustomer.IAuthorization.ILogin
        ): Promise<Member>
    {
        if (customer.member.id !== null)
            throw new nest.ForbiddenException("You've already logged-in as a member.");

        // FIND MATCHED MEMBER
        const member: Member | undefined = await Member
            .createQueryBuilder()
            .andWhere(...Member.getWhereArguments("email", input.email))
            .getOne();
        if (member === undefined)
            throw new nest.ForbiddenException("Unable to find the matched email.");
        else if (await member.password.equals(input.password) === false)
            throw new nest.ForbiddenException("Wrong password.");
        
        // COMPARE CITIZEN
        if (customer.member.id === null && customer.citizen.id !== null)
        {
            const oldbie: Citizen = (await customer.citizen.get())!;
            const newbie: Citizen = await member.citizen.get();

            if (oldbie.mobile !== newbie.mobile || oldbie.name !== newbie.name)
                throw new nest.ForbiddenException("You've already activated as a different citizen.");
        }

        // RETURNS WITH ASSIGNMENT
        await assign(orm.getManager(), customer, member);
        return member;
    }

    async function assign
        (
            manager: orm.EntityManager, 
            customer: BbsCustomer, 
            member: Member
        ): Promise<void>
    {
        customer.member.set(member);
        customer.citizen.set(await member.citizen.get());
        await customer.update(manager);
    }
}