import api from "../../../../../../api";
import { IBbsCustomer } from "../../../../../../api/structures/bbs/actors/IBbsCustomer";
import { ICitizen } from "../../../../../../api/structures/members/ICitizen";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { test_bbs_customer_issue } from "./test_bbs_customer_issue";

export async function test_bbs_customer_activate(connection: api.IConnection): Promise<IBbsCustomer<true>>
{
    const customer: IBbsCustomer<false> = await test_bbs_customer_issue(connection);
    const citizen: ICitizen = await api.functional.bbs.customers.authenticate.activate
    (
        connection,
        {
            mobile: RandomGenerator.mobile(),
            name: RandomGenerator.name(),
        }
    );

    return {
        ...customer,
        citizen
    };
}