import * as nest from "@nestjs/common";

import { IBbsAdministrator } from "../../../api/structures/bbs/actors/IBbsAdministrator";

import { BbsAdministrator } from "../../../models/tables/bbs/actors/BbsAdministrator";
import { Member } from "../../../models/tables/members/Member";

import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsAdminProvider
{
    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export async function json(admin: BbsAdministrator): Promise<IBbsAdministrator>
    {
        const member: Member = await admin.base.get();
        return await MemberProvider.json(member);
    }

    /* ----------------------------------------------------------------
        AUTHORIZATIONS
    ---------------------------------------------------------------- */
    export async function login(input: IBbsAdministrator.IAuthorization.ILogin): Promise<BbsAdministrator>
    {
        const manager: BbsAdministrator | undefined = await BbsAdministrator
            .createJoinQueryBuilder(admin => admin.innerJoinAndSelect("base"))
            .andWhere(...Member.getWhereArguments("email", "=", input.email))
            .getOne();
        if (manager === undefined)
            throw new nest.ForbiddenException("Unable to find the matched account.");

        const member: Member = await manager.base.get();
        if (await member.password.equals(input.password) === false)
            throw new nest.ForbiddenException("Wrong password.");

        return manager;
    }
}