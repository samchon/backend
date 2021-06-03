import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsAdministrator } from "../bbs/actors/BbsAdministrator";
import { BbsCustomer } from "../bbs/actors/BbsCustomer";
import { BbsManager } from "../bbs/actors/BbsManager";
import { Citizen } from "./Citizen";

@orm.Entity()
export class Member extends safe.Model
{
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @orm.Index({ unique: true })
    @orm.Column("varchar")
    public readonly email!: string;
    
    @safe.Belongs.ManyToOne(() => Citizen,
        citizen => citizen.members,
        "uuid",
        "citizen_id"
    )
    public readonly citizen!: safe.Belongs.ManyToOne<Citizen, "uuid">;

    @orm.Column(() => safe.Password)
    public readonly password: safe.Password = new safe.Password();

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

    @safe.Has.OneToOne
    (
        () => BbsManager,
        manager => manager.base
    )
    public readonly manager!:safe.Has.OneToOne<BbsManager>;

    @safe.Has.OneToMany
    (
        () => BbsCustomer as safe.Model.Creator<BbsCustomer<true>>,
        customer => customer.member,
        (x, y) => x.created_at.getTime() < y.created_at.getTime()
    )
    public readonly customers!: safe.Has.OneToMany<BbsCustomer<true>>;
}