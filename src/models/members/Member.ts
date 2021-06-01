import * as orm from "typeorm";
import safe from "safe-typeorm";

import { Citizen } from "./Citizen";
import { BbsCustomer } from "../bbs/actors/BbsCustomer";
import { BbsSectionManager } from "../bbs/actors/BbsSectionManager";
import { BbsAdministrator } from "../bbs/actors/BbsAdministrator";

@orm.Entity()
export class Member extends safe.Model
{
    @orm.PrimaryColumn("uuid")
    public readonly id!: string;
    
    @safe.Belongs.ManyToOne(() => Citizen,
        citizen => citizen.members,
        "uuid",
        "citizen_id"
    )
    public readonly citizen!: safe.Belongs.ManyToOne<Citizen, "uuid">;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToMany
    (
        () => BbsAdministrator,
        admin => admin.base
    )
    public readonly administrator!: safe.Has.OneToOne<BbsAdministrator>;

    @safe.Has.OneToMany
    (
        () => BbsCustomer,
        customer => customer.member,
        (x, y) => x.created_at.getTime() < y.created_at.getTime()
    )
    public readonly customers!: safe.Has.OneToMany<BbsCustomer>;

    @safe.Has.OneToMany
    (
        () => BbsSectionManager,
        manager => manager.member,
        (x, y) => x.created_at.getTime() < y.created_at.getTime()
    )
    public readonly managers!:safe.Has.OneToMany<BbsSectionManager>;
}