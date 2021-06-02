import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { AesPkcs5 } from "safe-typeorm";

import { Citizen } from "../../models/tables/members/Citizen";
import { Member } from "../../models/tables/members/Member";
import { IMember } from "../../api/structures/members/IMember";

import { CitizenProvider } from "./CitizenProvider";
import { RandomGenerator } from "../../utils/RandomGenerator";

export namespace MemberProvider
{
    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export async function json(member: Member): Promise<IMember>
    {
        const citizen: Citizen = await member.citizen.get();
        return {
            ...member.toPrimitive(),
            citizen: citizen.toPrimitive()
        };
    }

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export async function collect
        (
            collection: safe.InsertCollection, 
            input: IMember.IJoin
        ): Promise<Member>
    {
        const citizen: Citizen = await CitizenProvider.collect(collection, input.citizen);
        const member: Member = Member.initialize({
            id: safe.DEFAULT,
            citizen,
            email: input.email,
            created_at: safe.DEFAULT
        });
        await member.password.set(input.password);
        return collection.push(member);
    }

    export async function changePassword
        (
            member: Member, 
            input: IMember.IChangePassword
        ): Promise<void>
    {
        if (await member.password.equals(input.oldbie) === false)
            throw new nest.ForbiddenException("Invalid password.");

        await member.password.set(input.newbie);
        await member.update();
    }

    export async function resetPassword(input: IMember.IResetPassword): Promise<void>
    {
        // FIND MEMBER
        const member: Member = await Member
            .createJoinQueryBuilder(member => member.innerJoin("citizen"))
            .andWhere(...Citizen.getWhereArguments("mobile", AesPkcs5.encode(input.mobile, Citizen.ENCRYPTION_PASSWORD.key, Citizen.ENCRYPTION_PASSWORD.iv)))
            .getOneOrFail();
        
        // CHANGE PASSWORD
        const password: string = RandomGenerator.alphabets(8);
        await member.password.set(password);
        await member.update();
    }
}