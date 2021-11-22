import * as orm from "typeorm";
import safe from "safe-typeorm";

import { __MvBbsArticleLastContent } from "../../../material/common/__MvBbsArticleLastContent";
import { BbsArticleComment } from "./BbsArticleComment";
import { BbsArticleContent } from "./BbsArticleContent";

@orm.Entity()
export class BbsArticle extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @orm.Index()
    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    @orm.DeleteDateColumn()
    public readonly deleted_at!: Date | null;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToOne
    (
        () => __MvBbsArticleLastContent,
        material => material.article,
    )
    public readonly __mv_last!: safe.Has.OneToOne<__MvBbsArticleLastContent>;

    @safe.Has.OneToMany
    (
        () => BbsArticleComment,
        comment => comment.article,
        (x, y) => x.created_at.getTime() - y.created_at.getTime()
    )
    public readonly comments!: safe.Has.OneToMany<BbsArticleComment>;

    @safe.Has.OneToMany
    (
        () => BbsArticleContent,
        content => content.article,
        (x, y) => x.created_at.getTime() - y.created_at.getTime()
    )
    public readonly contents!: safe.Has.OneToMany<BbsArticleContent>;
}