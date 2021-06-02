import { IBbsSection } from "../../../api/structures/bbs/systematics/IBbsSection";

import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { BbsSectionNomination } from "../../../models/tables/bbs/systematics/BbsSectionNomination";

import { ArrayUtil } from "../../../utils/ArrayUtil";
import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsSectionProvider
{
    export async function index(): Promise<IBbsSection[]>
    {
        // GET ALL SECTIONS
        const sectionList: BbsSection[] = await BbsSection
            .createQueryBuilder()
            .orderBy(BbsSection.getColumn("created_at", null), "ASC")
            .getMany();
        
        // COMPOSE THE COMPLICATE DATA
        return await ArrayUtil.asyncMap(sectionList, async section =>
        {
            const nominations: BbsSectionNomination[] = await section.nominations.get();
            return {
                ...section.toPrimitive(),
                managers: await ArrayUtil.asyncMap(nominations, async nomi =>
                {
                    const manager: BbsManager = await nomi.manager.get();
                    return {
                        ...await MemberProvider.json(await manager.base.get()),
                        nominated_at: nomi.created_at.toString()
                    };
                })
            };
        });
    }
}