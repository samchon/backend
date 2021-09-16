import { assertType } from "typescript-is";
import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { IMember } from "../../../../../../api/structures/members/IMember";
import { prepare_random_member } from "../internal/prepare_random_member";
import { test_bbs_customer_issue } from "./test_bbs_customer_issue";

export async function test_bbs_customer_join(connection: api.IConnection): Promise<IBbsCustomer>
{
    const customer: IBbsCustomer = await test_bbs_customer_issue(connection);
    const member: IMember = await api.functional.bbs.customers.authenticate.join
    (
        connection,
        prepare_random_member()
    );
    assertType<typeof member>(member);

    return {
        ...customer,
        citizen: member.citizen,
        member
    };
}