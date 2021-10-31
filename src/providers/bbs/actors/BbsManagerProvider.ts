import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { IBbsManager } from "../../../api/structures/bbs/actors/IBbsManager";

import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsSection } from "../../../models/tables/bbs/systematic/BbsSection";
import { BbsSectionNomination } from "../../../models/tables/bbs/systematic/BbsSectionNomination";
import { Member } from "../../../models/tables/members/Member";

import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsManagerProvider
{
    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export function json(): safe.JsonSelectBuilder<BbsManager, any, IBbsManager>
    {
        return json_builder.get();
    }

    const json_builder = new Singleton(() => BbsManager.createJsonSelectBuilder
    (
        {
            base: MemberProvider.json(),
            nominations: BbsSectionNomination.createJsonSelectBuilder
            (
                {
                    section: BbsSection.createJsonSelectBuilder({}),
                },
                output => ({
                    ...output.section,
                    nominated_at: output.created_at
                })
            ),
        },
        output => ({
            ...output.base,
            sections: output.nominations
        })
    ));

    export function reference(): safe.JsonSelectBuilder<BbsManager, any, IBbsManager.IReference>
    {
        return reference_builder.get();
    }

    const reference_builder = new Singleton(() => BbsManager.createJsonSelectBuilder
    (
        {
            base: MemberProvider.json(),
        },
        output => output.base
    ));

    /* ----------------------------------------------------------------
        AUTHORIZATIONS
    ---------------------------------------------------------------- */
    export async function login(input: IBbsManager.IAuthorization.ILogin): Promise<BbsManager>
    {
        const manager: BbsManager | undefined = await BbsManager
            .createJoinQueryBuilder(manager => manager.innerJoinAndSelect("base"))
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