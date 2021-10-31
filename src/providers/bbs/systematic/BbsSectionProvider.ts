import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { IBbsSection } from "../../../api/structures/bbs/systematic/IBbsSection";
import { Writable } from "../../../api/typings/Writable";

import { BbsSection } from "../../../models/tables/bbs/systematic/BbsSection";
import { BbsSectionNomination } from "../../../models/tables/bbs/systematic/BbsSectionNomination";

import { BbsManagerProvider } from "../actors/BbsManagerProvider";

export namespace BbsSectionProvider
{
    export async function index(): Promise<IBbsSection[]>
    {
        // GET ALL SECTIONS
        const sections: BbsSection[] = await BbsSection
            .createQueryBuilder()
            .orderBy(BbsSection.getColumn("created_at", null), "ASC")
            .getMany();
        
        // COMPOSE THE COMPLICATE DATA
        return await json().getMany(sections);
    }

    export async function find(code: string, type?: IBbsSection.Type): Promise<BbsSection>
    {
        const section: BbsSection = await BbsSection.findOneOrFail({ code });
        if (type !== undefined && type !== section.type)
            throw new nest.ConflictException(`Type of the target section "${code}" is not "${type}" but "${section.type}".`);
        
        return section;
    }

    export function json(): safe.JsonSelectBuilder<BbsSection, any, IBbsSection>
    {
        return json_builder.get();
    }

    const json_builder = new Singleton(() => BbsSection.createJsonSelectBuilder
    (
        {
            nominations: BbsSectionNomination.createJsonSelectBuilder
            (
                {
                    manager: BbsManagerProvider.reference(),
                },
                output => ({
                    ...output.manager,
                    nominated_at: output.created_at
                })
            ),
        },
        output => ({
            ...output,
            managers: output.nominations,
            nominations: undefined
        })
    ));

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