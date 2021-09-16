import safe from "safe-typeorm";

import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsSection } from "../../../models/tables/bbs/systematic/BbsSection";
import { BbsSectionNomination } from "../../../models/tables/bbs/systematic/BbsSectionNomination";
import { Member } from "../../../models/tables/members/Member";

export namespace BbsSectionNominationProvider
{
    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export async function store(section: BbsSection, member: Member): Promise<BbsSectionNomination>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();

        let manager: BbsManager | null = await member.manager.get();
        if (manager === null)
        {
            manager = BbsManager.initialize({
                base: member,
                created_at: safe.DEFAULT
            });
            await member.manager.set(manager);
            collection.push(manager);
        }

        const nomination: BbsSectionNomination = BbsSectionNomination.initialize({
            id: safe.DEFAULT,
            section,
            manager,
            created_at: safe.DEFAULT
        });
        collection.push(nomination);

        await collection.execute();
        return nomination;
    }
}