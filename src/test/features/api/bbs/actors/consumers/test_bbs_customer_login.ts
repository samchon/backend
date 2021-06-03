import api, { Primitive } from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { IMember } from "../../../../../../api/structures/members/IMember";
import { Configuration } from "../../../../../../Configuration";
import { exception_must_be_thrown } from "../../../../../internal/exception_must_be_thrown";
import { test_bbs_customer_issue } from "./test_bbs_customer_issue";
import { test_bbs_customer_join } from "./test_bbs_customer_join";

export async function test_bbs_customer_login(connection: api.IConnection): Promise<IBbsCustomer<true>>
{
    const customer: IBbsCustomer<true> = await test_bbs_customer_join(connection);
    delete (connection.headers as any)["bbs-customer-authorization"];

    const reloaded: IBbsCustomer<false> = await test_bbs_customer_issue(connection);
    await exception_must_be_thrown
    (
        "Invalid password", 
        () => api.functional.bbs.customers.authenticate.login
        (
            connection,
            {
                email: customer.member!.email,
                password: "Wrong Password"
            }
        )
    );

    const member: IMember = await api.functional.bbs.customers.authenticate.login
    (
        connection,
        {
            email: customer.member!.email,
            password: Configuration.SYSTEM_PASSWORD
        }
    );
    if (Primitive.equal_to(member, customer.member!) === false)
        throw new Error("Bug on BbsCustomerProvider.login(): different result with join().");

    return {
        ...reloaded,
        citizen: member.citizen,
        member,
    };
}