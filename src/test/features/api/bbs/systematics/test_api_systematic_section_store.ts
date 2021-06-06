import api from "../../../../../api";
import { IBbsSection } from "../../../../../api/structures/bbs/systematics/IBbsSection";

import { generate_bbs_section } from "../articles/internal/generate_bbs_section";

export async function test_api_systematic_section_store(connection: api.IConnection): Promise<IBbsSection[]>
{
    const output: IBbsSection[] = [];
    for (const type of ["FREE", "QNA", "NOTICE", "REVIEW"] as const)
        output.push(await generate_bbs_section(connection, type));

    return output;
}