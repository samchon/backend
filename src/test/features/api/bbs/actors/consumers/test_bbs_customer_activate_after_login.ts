import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { exception_must_be_thrown } from "../../../../../internal/exception_must_be_thrown";
import { test_bbs_customer_login } from "./test_bbs_customer_login";

export async function test_bbs_customer_activate_after_login(connection: api.IConnection): Promise<void>
{
    const customer: IBbsCustomer<true> = await test_bbs_customer_login(connection);
    await exception_must_be_thrown
    (
        "Activate after login",
        () => api.functional.bbs.customers.authenticate.activate
        (
            connection,
            customer.citizen
        )
    );
}