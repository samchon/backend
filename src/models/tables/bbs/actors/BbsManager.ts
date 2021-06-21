import * as orm from "typeorm";
import safe from "safe-typeorm";

import { Member } from "../../members/Member";
import { BbsAnswerArticle } from "../articles/BbsAnswerArticle";
import { BbsComment } from "../articles/BbsComment";
import { BbsNoticeArticle } from "../articles/BbsNoticeArticle";
import { BbsSectionNomination } from "../systematic/BbsSectionNomination";

@orm.Entity()
export class BbsManager extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @safe.Belongs.OneToOne(() => Member,
        base => base.manager,
        "uuid",
        "id",
        { primary: true }
    )
    public readonly base!: safe.Belongs.OneToOne<Member, "uuid">;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

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

    @safe.Has.OneToMany
    (
        () => BbsSectionNomination,
        nomination => nomination.manager,
        (x, y) => x.created_at.getTime() < y.created_at.getTime()
    )
    public readonly nominations!: safe.Has.OneToMany<BbsSectionNomination>;
}