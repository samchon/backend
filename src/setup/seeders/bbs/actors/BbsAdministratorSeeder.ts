import safe from "safe-typeorm";

import { Configuration } from "../../../../Configuration";

import { BbsAdministrator } from "../../../../models/tables/bbs/actors/BbsAdministrator";
import { Member } from "../../../../models/tables/members/Member";

import { MemberProvider } from "../../../../providers/members/MemberProvider";

export namespace BbsAdministratorSeeder
{
    export async function seed(): Promise<void>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const base: Member = await MemberProvider.collect(collection, {
            email: "admin@samchon.org",
            password: Configuration.SYSTEM_PASSWORD,
            citizen: {
                name: "Administrator",
                mobile: "821000000000"
            }
        });
        
        const admin: BbsAdministrator = BbsAdministrator.initialize({ base });
        collection.push(admin);
        await collection.execute();
    }
}