import * as orm from "typeorm";
import safe from "safe-typeorm";

import { AttachmentFile } from "../../misc/AttachmentFile";
import { BbsArticle } from "./BbsArticle";
import { BbsArticleContentFile } from "./BbsArticleContentFile";
import { BbsReviewArticleContent } from "./BbsReviewArticleContent";
import { __MvBbsArticleLastContent } from "../../../material/bbs/__MvBbsArticleLastContent";

import { ColumnType } from "../../../internal/ColumnType";

@orm.Entity()
export class BbsArticleContent extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryColumn("uuid")
    public readonly id!: string;

    @safe.Belongs.ManyToOne(() => BbsArticle,
        article => article.contents,
        "uuid",
        "bbs_article_id",
        { index: true }
    )
    public readonly article!: safe.Belongs.ManyToOne<BbsArticle, "uuid">;

    @orm.Column("varchar")
    public readonly title!: string;

    @orm.Column(ColumnType.text())
    public readonly body!: string;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.ManyToMany
    (
        () => AttachmentFile,
        () => BbsArticleContentFile,
        router => router.file,
        router => router.content,
        (x, y) => x.router.sequence < y.router.sequence
    )
    public readonly files!: safe.Has.ManyToMany<AttachmentFile, BbsArticleContentFile>;

    @safe.Has.OneToOne
    (
        () => BbsReviewArticleContent,
        reviewContent => reviewContent.base
    )
    public readonly reviewContent!: safe.Has.OneToOne<BbsReviewArticleContent>;

    @safe.Has.OneToOne
    (
        () => __MvBbsArticleLastContent,
        material => material.content
    )
    public readonly __mv_last!: safe.Has.OneToOne<__MvBbsArticleLastContent>;
}
