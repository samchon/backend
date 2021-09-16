import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { IMember } from "../../../../../../api/structures/members/IMember";
import { Configuration } from "../../../../../../Configuration";
import { exception_must_be_thrown } from "../../../../../internal/exception_must_be_thrown";
import { bbs_customer_logout } from "../internal/bbs_customer_logout";
import { test_bbs_customer_activate } from "./test_bbs_customer_activate";
import { test_bbs_customer_issue } from "./test_bbs_customer_issue";
import { test_bbs_customer_join } from "./test_bbs_customer_join";

export async function test_bbs_customer_login_after_activate(connection: api.IConnection): Promise<void>
{
    const customer: IBbsCustomer = await test_bbs_customer_join(connection);
    const member: IMember = customer.member!;

    bbs_customer_logout(connection);
    await test_bbs_customer_issue(connection);
    await test_bbs_customer_activate(connection);
    await exception_must_be_thrown
    (
        "Login as customer with different citizen",
        () => api.functional.bbs.customers.authenticate.login
        (
            connection,
            {
                email: member.email,
                password: Configuration.SYSTEM_PASSWORD
            }
        )
    );

    bbs_customer_logout(connection);
    await test_bbs_customer_issue(connection);
    await api.functional.bbs.customers.authenticate.activate
    (
        connection,
        member.citizen
    );
    await api.functional.bbs.customers.authenticate.login
    (
        connection,
        {
            email: member.email,
            password: Configuration.SYSTEM_PASSWORD
        }
    );
}