import { IBbsManager } from "../../../api/structures/bbs/actors/IBbsManager";

import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { BbsSectionNomination } from "../../../models/tables/bbs/systematics/BbsSectionNomination";

import { ArrayUtil } from "../../../utils/ArrayUtil";
import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsManagerProvider
{
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
}