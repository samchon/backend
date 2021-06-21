import api from "../../../../../api";
import { IBbsSection } from "../../../../../api/structures/bbs/systematic/IBbsSection";

import { RandomGenerator } from "../../../../../utils/RandomGenerator";
import { test_api_systematic_section_store } from "./test_api_systematic_section_store";

export async function test_api_systematic_section_update(connection: api.IConnection): Promise<void>
{
    const sectionList: IBbsSection[] = await test_api_systematic_section_store(connection);
    for (const section of sectionList)
        await api.functional.bbs.admins.systematic.sections.update
        (
            connection,
            section.code,
            { name: RandomGenerator.name() 
        });
}