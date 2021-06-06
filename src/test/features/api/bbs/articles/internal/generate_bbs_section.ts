import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsManager } from "../../../../../../api/structures/bbs/actors/IBbsManager";
import { IBbsSection } from "../../../../../../api/structures/bbs/systematics/IBbsSection";

import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { test_api_bbs_admin_login } from "../../actors/admins/test_bbs_admin_login";
import { test_bbs_manager_login } from "../../actors/managers/test_bbs_manager_login";

export async function generate_bbs_section(connection: api.IConnection, type: IBbsSection.Type): Promise<IBbsSection>
{
    await test_api_bbs_admin_login(connection);
    const manager: IBbsManager = await test_bbs_manager_login(connection);
    const section: IBbsSection = await api.functional.bbs.admins.systematics.sections.store
    (
        connection,
        {
            type,
            code: RandomGenerator.alphabets(16),
            name: RandomGenerator.name()
        }
    );
    assertType<typeof section>(section);

    await api.functional.bbs.admins.systematics.sections.nominations.store
    (
        connection,
        section.code,
        manager.id
    );
    return section;
}