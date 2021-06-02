import * as orm from "typeorm";
import safe from "safe-typeorm";

import { Member } from "../../members/Member";

@orm.Entity()
export class BbsAdministrator extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @safe.Belongs.OneToOne(() => Member,
        member => member.administrator,
        "uuid",
        "member_id",
        { primary: true }
    )
    public readonly base!: safe.Belongs.OneToOne<Member, "uuid">;
}