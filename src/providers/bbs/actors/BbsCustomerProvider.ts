import { IBbsCustomer } from "../../../api/structures/bbs/actors/IBbsCustomer";

import { BbsCustomer } from "../../../models/tables/bbs/actors/BbsCustomer";
import { Citizen } from "../../../models/tables/members/Citizen";
import { Member } from "../../../models/tables/members/Member";

import { CitizenProvider } from "../../members/CitizenProvider";
import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsCustomerProvider
{
    export async function json<Ensure extends boolean>
        (customer: BbsCustomer<Ensure>): Promise<IBbsCustomer<Ensure>>
    {
        const citizen: Citizen | null = await customer.citizen.get();
        const member: Member | null = await customer.member.get();

        return {
            ...customer.toPrimitive(),
            citizen: citizen !== null
                ? await CitizenProvider.json(citizen)
                : null as any,
            member: member !== null
                ? await MemberProvider.json(member)
                : null,
        }
    }
}