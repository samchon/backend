import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { ICitizen } from "../../api/structures/common/ICitizen";
import { Writable } from "../../api/typings/Writable";

import { Citizen } from "../../models/tables/common/Citizen";

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
        let citizen: Citizen | undefined = await Citizen
            .createQueryBuilder()
            .andWhere(...Citizen.getWhereArguments("mobile", 
                safe.AesPkcs5.encrypt
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
        else if (citizen.name !== input.name)
        {
            Writable(citizen).name  = input.name;
            collection.after(() => citizen!.update());
        }
        return citizen;
    }
}