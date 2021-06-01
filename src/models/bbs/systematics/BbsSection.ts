import * as orm from "typeorm";
import safe from "safe-typeorm";

import { IBbsSection } from "../../../api/structures/bbs/systematics/IBbsSection";

import { BbsArticle } from "../articles/BbsArticle";
import { BbsSectionManager } from "../actors/BbsSectionManager";

@orm.Entity()
export class BbsSection extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryColumn("uuid")
    public readonly id!: string;

    @orm.Index({ unique: true })
    @orm.Column("varchar")
    public readonly code!: string;

    @orm.Column("varchar")
    public readonly type!: IBbsSection.Type;

    @orm.Column("varchar")
    public readonly name!: string;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    @orm.DeleteDateColumn()
    public readonly deleted_at!: Date | null;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToMany
    (
        () => BbsArticle,
        article => article.section
    )
    public readonly articles!: safe.Has.OneToMany<BbsArticle>;

    @safe.Has.OneToMany
    (
        () => BbsSectionManager,
        manager => manager.section
    )
    public readonly managers!: safe.Has.OneToMany<BbsSectionManager>;
}