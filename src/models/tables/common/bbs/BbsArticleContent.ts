import * as orm from "typeorm";
import safe from "safe-typeorm";

import { __MvBbsArticleLastContent } from "../../../material/common/__MvBbsArticleLastContent";
import { BbsArticle } from "./BbsArticle";
import { AttachmentFile } from "../AttachmentFile";
import { BbsArticleContentFile } from "./BbsArticleContentFile";

@orm.Index(["bbs_article_id", "created_at"])
@orm.Entity()
export class BbsArticleContent 
    extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @safe.Belongs.ManyToOne(() => BbsArticle,
        "uuid",
        "bbs_article_id",
        // INDEXED
    )
    public readonly article!: safe.Belongs.ManyToOne<BbsArticle, "uuid">;

    @orm.Column("varchar")
    public readonly format!: "TEXT" | "MARKDOWN" | "HTML";

    @orm.Column("varchar", { length: 1024 })
    public readonly title!: string;

    @orm.Column("longtext")
    public readonly body!: string;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToOne
    (
        () => __MvBbsArticleLastContent,
        material => material.content,
    )
    public readonly __mv_last!: safe.Has.OneToOne<__MvBbsArticleLastContent>;

    @safe.Has.ManyToMany
    (
        () => AttachmentFile,
        () => BbsArticleContentFile,
        router => router.file,
        router => router.content,
        (x, y) => x.router.sequence - y.router.sequence
    )
    public readonly files!: safe.Has.ManyToMany<AttachmentFile, BbsArticleContentFile>;
}