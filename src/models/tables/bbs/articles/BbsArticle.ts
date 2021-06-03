import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsSection } from "../systematics/BbsSection";
import { BbsArticleContent } from "./BbsArticleContent";
import { BbsComment } from "./BbsComment";

import { BbsAnswerArticle } from "./BbsAnswerArticle";
import { BbsFreeArticle } from "./BbsFreeArticle";
import { BbsNoticeArticle } from "./BbsNoticeArticle";
import { BbsQuestionArticle } from "./BbsQuestionArticle";
import { BbsReviewArticle } from "./BbsReviewArticle";
import { __MvBbsArticleHit } from "../../../material/bbs/__MvBbsArticleHit";
import { __MvBbsArticleLastContent } from "../../../material/bbs/__MvBbsArticleLastContent";

@orm.Entity()
export class BbsArticle extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;
    
    @safe.Belongs.ManyToOne(() => BbsSection,
        section => section.articles,
        "uuid",
        "bbs_section_id",
        { index: true }
    )
    public readonly section!: safe.Belongs.ManyToOne<BbsSection, "uuid">;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToMany
    (
        () => BbsArticleContent,
        content => content.article,
        (x, y) => x.created_at.getTime() < y.created_at.getTime(),
    )
    public readonly contents!: safe.Has.OneToMany<BbsArticleContent>;

    @safe.Has.OneToMany
    (
        () => BbsComment,
        comment => comment.article,
        (x, y) => x.created_at.getTime() < y.created_at.getTime()
    )
    public readonly comments!: safe.Has.OneToMany<BbsComment>;

    @safe.Has.OneToOne
    (
        () => __MvBbsArticleHit, 
        material => material.article
    )
    public readonly __mv_hit!: safe.Has.OneToOne<__MvBbsArticleHit>;

    @safe.Has.OneToOne
    (
        () => __MvBbsArticleLastContent, 
        material => material.article
    )
    public readonly __mv_last!: safe.Has.OneToOne<__MvBbsArticleLastContent>;

    /* -----------------------------------------------------------
        SUB-TYPES
    ----------------------------------------------------------- */
    @safe.Has.OneToOne
    (
        () => BbsAnswerArticle, 
        sub => sub.base
    )
    public readonly answer!: safe.Has.OneToOne<BbsAnswerArticle>;

    @safe.Has.OneToOne
    (
        () => BbsFreeArticle, 
        sub => sub.base
    )
    public readonly free!: safe.Has.OneToOne<BbsFreeArticle>;

    @safe.Has.OneToOne
    (
        () => BbsNoticeArticle, 
        sub => sub.base
    )
    public readonly notice!: safe.Has.OneToOne<BbsNoticeArticle>;

    @safe.Has.OneToOne
    (
        () => BbsQuestionArticle, 
        sub => sub.base
    )
    public readonly question!: safe.Has.OneToOne<BbsQuestionArticle>;

    @safe.Has.OneToOne
    (
        () => BbsReviewArticle, 
        sub => sub.base
    )
    public readonly review!: safe.Has.OneToOne<BbsReviewArticle>;
}

export namespace BbsArticle
{
    export interface ISubType extends safe.Model
    {
        readonly base: safe.Belongs.OneToOne<BbsArticle, "uuid">;
    }
}