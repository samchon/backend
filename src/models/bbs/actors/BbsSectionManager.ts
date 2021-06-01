import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsSection } from "../systematics/BbsSection";
import { Member } from "../../members/Member";
import { BbsAnswerArticle } from "../articles/BbsAnswerArticle";
import { BbsNoticeArticle } from "../articles/BbsNoticeArticle";
import { BbsComment } from "../articles/BbsComment";

@orm.Unique(["bbs_section_id", "member_id"])
@orm.Entity()
export class BbsSectionManager extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryColumn("uuid")
    public readonly id!: string;

    @safe.Belongs.ManyToOne(() => BbsSection,
        section => section.managers,
        "uuid",
        "bbs_section_id"
    )
    public readonly section!: safe.Belongs.ManyToOne<BbsSection, "uuid">;

    @safe.Belongs.ManyToOne(() => Member,
        member => member.managers,
        "uuid",
        "member_id",
        { index: true }
    )
    public readonly member!: safe.Belongs.ManyToOne<Member, "uuid">;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    @orm.Column("datetime", { nullable: true })
    public readonly deleted_at!: Date | null;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToMany
    (
        () => BbsAnswerArticle,
        answer => answer.manager
    )
    public readonly answers!: safe.Has.OneToMany<BbsAnswerArticle>;

    @safe.Has.OneToMany
    (
        () => BbsNoticeArticle,
        notice => notice.manager
    )
    public readonly notices!: safe.Has.OneToMany<BbsNoticeArticle>;

    @safe.Has.OneToMany
    (
        () => BbsComment,
        comment => comment.manager,
        (x, y) => x.created_at.getTime() < y.created_at.getTime()
    )
    public readonly comments!: safe.Has.OneToMany<BbsComment>;
}