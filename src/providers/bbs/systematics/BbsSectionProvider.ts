import * as nest from "@nestjs/common";
import safe from "safe-typeorm";

import { IBbsSection } from "../../../api/structures/bbs/systematics/IBbsSection";
import { Writable } from "../../../api/typings/Writable";

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

    export async function find(code: string, type?: IBbsSection.Type): Promise<BbsSection>
    {
        const section: BbsSection = await BbsSection.findOneOrFail({ code });
        if (type !== undefined && type !== section.type)
            throw new nest.ConflictException(`Type of the target section "${code}" is not "${type}" but "${section.type}".`);
        
        return section;
    }

    export async function store(input: IBbsSection.IStore): Promise<BbsSection>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const section: BbsSection = BbsSection.initialize({
            id: safe.DEFAULT,
            type: input.type,
            code: input.code,
            name: input.name,
            created_at: safe.DEFAULT,
            deleted_at: null
        });

        collection.push(section);
        await collection.execute();

        return section;
    }

    export async function update(section: BbsSection, input: IBbsSection.IUpdate): Promise<void>
    {
        Writable(section).name = input.name;
        await section.update();
    }
}