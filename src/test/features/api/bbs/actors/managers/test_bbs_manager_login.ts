import { Singleton } from "tstl/thread/Singleton";
import { assertType } from "typescript-is";
import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { IBbsManager } from "../../../../../../api/structures/bbs/actors/IBbsManager";
import { IBbsSection } from "../../../../../../api/structures/bbs/systematics/IBbsSection";
import { IMember } from "../../../../../../api/structures/members/IMember";
import { Configuration } from "../../../../../../Configuration";
import { test_api_bbs_admin_login } from "../admins/test_bbs_admin_login";
import { test_bbs_customer_join } from "../consumers/test_bbs_customer_join";

const singleton: Singleton<IBbsSection, [api.IConnection]> = new Singleton(async connection =>
{
    await test_api_bbs_admin_login(connection);

    const section: IBbsSection = await api.functional.bbs.admins.systematics.sections.store
    (
        connection,
        {
            type: "FREE",
            code: "dummy-section-for-manager-creation",
            name: "Dummy Section for Manager Creation"
        }
    );
    return assertType<typeof section>(section);
});

export async function test_bbs_manager_login(connection: api.IConnection): Promise<IBbsManager>
{
    const section: IBbsSection = await singleton.get(connection);
    const customer: IBbsCustomer<true> = await test_bbs_customer_join(connection);
    const member: IMember = customer.member!;

    const nominated: IBbsSection.INominatedManager = await api.functional.bbs.admins.systematics.sections.nominations.store
    (
        connection, 
        section.code, 
        member.id
    );
    assertType<typeof nominated>(nominated);

    await api.functional.bbs.admins.systematics.sections.nominations.erase
    (
        connection,
        section.code,
        member.id
    );

    const manager: IBbsManager = await api.functional.bbs.managers.authenticate.login
    (
        connection,
        {
            email: member.email,
            password: Configuration.SYSTEM_PASSWORD
        }
    );
    return assertType<typeof manager>(manager);
}