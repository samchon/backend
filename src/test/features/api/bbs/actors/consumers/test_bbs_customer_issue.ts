import { assertType } from "typescript-is";

import api from "../../../../../../api";

import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";

export async function test_bbs_customer_issue(connection: api.IConnection): Promise<IBbsCustomer>
{
    const customer: IBbsCustomer = await api.functional.bbs.customers.authenticate.issue
    (
        connection,
        {
            href: __filename,
            referrer: "Test Automation Program"
        }
    );
    assertType<typeof customer>(customer);

    if (customer.member !== null)
        throw new Error(`Bug on BbsCustomerProvider.issue(): variable ".member" must be null.`);
    else if (customer.citizen !== null)
        throw new Error(`Bug on BbsCustomerProvider.issue(): variable ".citizen" must be null.`);

    return customer;
}