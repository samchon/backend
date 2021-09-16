import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";
import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsAdministrator } from "../../../../../../api/structures/bbs/actors/IBbsAdministrator";

import { BbsAdministrator } from "../../../../../../models/tables/bbs/actors/BbsAdministrator";
import { Member } from "../../../../../../models/tables/members/Member";

import { Configuration } from "../../../../../../Configuration";
import { MemberProvider } from "../../../../../../providers/members/MemberProvider";

const EMAIL = "robot-admin@samchon.org";

const singleton: Singleton<Promise<IBbsAdministrator>> = new Singleton(async () =>
{
    let admin: BbsAdministrator | undefined = await BbsAdministrator
        .createJoinQueryBuilder(admin => admin.innerJoinAndSelect("base"))
        .andWhere(...Member.getWhereArguments("email", EMAIL))
        .getOne();
    if (admin === undefined)
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const base: Member = await MemberProvider.collect
        (
            collection,
            {
                email: EMAIL,
                citizen: {
                    name: "로보트_관리자",
                    mobile: "000-0000-0000"
                },
                password: Configuration.SYSTEM_PASSWORD
            }
        );
        admin = collection.push(BbsAdministrator.initialize({ base }));
        await collection.execute();
    }
    return await MemberProvider.json().getOne(await admin.base.get());
});

export async function test_api_bbs_admin_login(connection: api.IConnection): Promise<IBbsAdministrator>
{
    await singleton.get();
    const admin: IBbsAdministrator = await api.functional.bbs.admins.authenticate.login
    (
        connection, 
        {
            email: EMAIL,
            password: Configuration.SYSTEM_PASSWORD
        }
    );
    return assertType<typeof admin>(admin);
}