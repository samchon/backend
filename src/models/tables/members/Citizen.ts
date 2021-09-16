import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsCustomer } from "../bbs/actors/BbsCustomer";
import { Member } from "./Member";

@orm.Entity()
export class Citizen extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @safe.EncryptedColumn("varchar", { 
        unique: true,
        password: () => Citizen.ENCRYPTION_PASSWORD
    })
    public readonly mobile!: string;

    @safe.EncryptedColumn("varchar", {
        unique: true,
        password: () => Citizen.ENCRYPTION_PASSWORD
    })
    public readonly name!: string;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToMany
    (
        () => Member,
        member => member.citizen
    )
    public readonly members!: safe.Has.OneToMany<Member>;

    @safe.Has.OneToMany
    (
        () => BbsCustomer as safe.Model.Creator<BbsCustomer<true>>,
        customer => customer.citizen,
        (x, y) => x.created_at.getTime() - y.created_at.getTime()
    )
    public readonly customers!: safe.Has.OneToMany<BbsCustomer<true>>;
}

export namespace Citizen
{
    export const ENCRYPTION_PASSWORD =
    {
        key: "QC18iDPsscjf9w7xwAO1Vs8XoBgVBiZO",
        iv: "dbZl5MX4kOpjexIa"
    };
}