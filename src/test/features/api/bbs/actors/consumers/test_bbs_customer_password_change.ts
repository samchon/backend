import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { IMember } from "../../../../../../api/structures/members/IMember";
import { Configuration } from "../../../../../../Configuration";
import { exception_must_be_thrown } from "../../../../../internal/exception_must_be_thrown";
import { bbs_customer_re_login } from "../internal/bbs_customer_re_login";
import { test_bbs_customer_join } from "./test_bbs_customer_join";

export async function test_bbs_customer_password_change(connection: api.IConnection): Promise<void>
{
    const customer: IBbsCustomer = await test_bbs_customer_join(connection);
    const member: IMember = customer.member!;

    await exception_must_be_thrown
    (
        "Login as customer with wrong password",
        () => bbs_customer_re_login(connection, member.email, "Wrong Password")
    );
    await bbs_customer_re_login(connection, member.email, Configuration.SYSTEM_PASSWORD);
}