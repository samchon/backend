import * as nest from "@nestjs/common";

import { IBbsManager } from "../../../api/structures/bbs/actors/IBbsManager";

import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { BbsSectionNomination } from "../../../models/tables/bbs/systematics/BbsSectionNomination";
import { Member } from "../../../models/tables/members/Member";

import { ArrayUtil } from "../../../utils/ArrayUtil";
import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsManagerProvider
{
    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export async function json(manager: BbsManager): Promise<IBbsManager>
    {
        const nominations: BbsSectionNomination[] = await manager.nominations.get();

        return {
            ...await MemberProvider.json(await manager.base.get()),
            sections: await ArrayUtil.asyncMap(nominations, async nomi =>
            {
                const section: BbsSection = await nomi.section.get();
                return {
                    ...section.toPrimitive(),
                    nominated_at: nomi.created_at.toString()
                };
            })
        };
    }

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