import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { IBbsAdministrator } from "../../../api/structures/bbs/actors/IBbsAdministrator";

import { BbsAdministrator } from "../../../models/tables/bbs/actors/BbsAdministrator";
import { Member } from "../../../models/tables/members/Member";

import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsAdminProvider
{
    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export function json(): safe.JsonSelectBuilder<BbsAdministrator, any, IBbsAdministrator>
    {
        return json_builder.get();
    }

    const json_builder = new Singleton(() => BbsAdministrator.createJsonSelectBuilder
    (
        { 
            base: MemberProvider.json()
        },
        output => output.base
    ))

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