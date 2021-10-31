import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { ICitizen } from "../../api/structures/members/ICitizen";

import { Citizen } from "../../models/tables/members/Citizen";
import { CitizenUtil } from "../../utils/CitizenUtil";

export namespace CitizenProvider
{
    /* ----------------------------------------------------------------
        ACCECSSORS
    ---------------------------------------------------------------- */
    export function json(): safe.JsonSelectBuilder<Citizen, any, ICitizen>
    {
        return json_builder.get();
    }

    const json_builder = new Singleton(() => Citizen.createJsonSelectBuilder({}));

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export async function collect
        (
            collection: safe.InsertCollection, 
            input: ICitizen.IStore
        ): Promise<Citizen>
    {
        // NORMALIZE THE MOBILE NUMBER
        input.mobile = CitizenUtil.mobile(input.mobile);

        // FIND THE CITIZEN
        let citizen: Citizen | undefined = await Citizen.createQueryBuilder()
            .andWhere(...Citizen.getWhereArguments("name", 
                safe.AesPkcs5.encode
                (
                    input.name, 
                    Citizen.ENCRYPTION_PASSWORD.key, 
                    Citizen.ENCRYPTION_PASSWORD.iv
                )
            ))
            .andWhere(...Citizen.getWhereArguments("mobile", 
                safe.AesPkcs5.encode
                (
                    input.mobile, 
                    Citizen.ENCRYPTION_PASSWORD.key, 
                    Citizen.ENCRYPTION_PASSWORD.iv
                )
            ))
            .getOne();

        if (citizen === undefined)
        {
            citizen = Citizen.initialize({ 
                id: safe.DEFAULT,
                created_at: safe.DEFAULT,
                ...input
            });
            collection.push(citizen);
        }
        return citizen;
    }
}