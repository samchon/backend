import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsManager } from "../actors/BbsManager";
import { BbsSection } from "./BbsSection";

@orm.Unique(["bbs_section_id", "bbs_manager_id"])
@orm.Entity()
export class BbsSectionNomination extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @safe.Belongs.ManyToOne(() => BbsSection,
        "uuid",
        "bbs_section_id"
    )
    public readonly section!: safe.Belongs.ManyToOne<BbsSection, "uuid">;

    @safe.Belongs.ManyToOne(() => BbsManager,
        "uuid",
        "bbs_manager_id",
        { index: true }
    )
    public readonly manager!: safe.Belongs.ManyToOne<BbsManager, "uuid">;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;
}