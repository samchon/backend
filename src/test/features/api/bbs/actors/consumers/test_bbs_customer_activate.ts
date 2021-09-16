import { assertType } from "typescript-is";
import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { ICitizen } from "../../../../../../api/structures/members/ICitizen";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { test_bbs_customer_issue } from "./test_bbs_customer_issue";

export async function test_bbs_customer_activate(connection: api.IConnection): Promise<IBbsCustomer>
{
    const customer: IBbsCustomer = await test_bbs_customer_issue(connection);
    const citizen: ICitizen = await api.functional.bbs.customers.authenticate.activate
    (
        connection,
        {
            mobile: RandomGenerator.mobile(),
            name: RandomGenerator.name(),
        }
    );
    assertType<typeof citizen>(citizen);

    return {
        ...customer,
        citizen
    };
}