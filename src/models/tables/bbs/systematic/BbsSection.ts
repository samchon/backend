import * as orm from "typeorm";
import safe from "safe-typeorm";

import { IBbsSection } from "../../../../api/structures/bbs/systematic/IBbsSection";

import { BbsArticle } from "../articles/BbsArticle";
import { BbsSectionNomination } from "./BbsSectionNomination";

@orm.Entity()
export class BbsSection extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
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
        () => BbsSectionNomination,
        nomination => nomination.section,
        (x, y) => x.created_at.getTime() < y.created_at.getTime()
    )
    public readonly nominations!: safe.Has.OneToMany<BbsSectionNomination>;
}