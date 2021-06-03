import { assertType } from "typescript-is";
import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { IMember } from "../../../../../../api/structures/members/IMember";

import { Configuration } from "../../../../../../Configuration";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { exception_must_be_thrown } from "../../../../../internal/exception_must_be_thrown";
import { prepare_random_citizen } from "../internal/prepare_random_citizen";
import { test_bbs_customer_activate } from "./test_bbs_customer_activate";

export async function test_bbs_customer_join_after_activate(connection: api.IConnection): Promise<void>
{
    const customer: IBbsCustomer<true> = await test_bbs_customer_activate(connection);

    // DIFFERENT CITIZEN
    await exception_must_be_thrown
    (
        "Customer join after activation with different citizen info",
        () => api.functional.bbs.customers.authenticate.join
        (
            connection,
            {
                email: `${RandomGenerator.alphabets(16)}@samchon.org`,
                password: Configuration.SYSTEM_PASSWORD,
                citizen: prepare_random_citizen()
            }
        )
    );

    // SAME CITIZEN
    const member: IMember = await api.functional.bbs.customers.authenticate.join
    (
        connection,
        {
            email: `${RandomGenerator.alphabets(16)}@samchon.org`,
            password: Configuration.SYSTEM_PASSWORD,
            citizen: customer.citizen
        }
    );
    assertType<typeof member>(member);
}