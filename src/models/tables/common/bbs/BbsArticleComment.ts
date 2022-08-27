import orm from "@modules/typeorm";
import safe from "safe-typeorm";

import { AttachmentFile } from "../AttachmentFile";
import { BbsArticle } from "./BbsArticle";
import { BbsArticleCommentFile } from "./BbsArticleCommentFile";

@orm.Index(["bbs_article_id", "created_at"])
@orm.Entity()
export class BbsArticleComment extends safe.Model {
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @safe.Belongs.ManyToOne(
        () => BbsArticle,
        "uuid",
        "bbs_article_id",
        // INDEX
    )
    public readonly article!: safe.Belongs.ManyToOne<BbsArticle, "uuid">;

    @orm.Column("varchar")
    public readonly format!: "TEXT" | "MARKDOWN" | "HTML";

    @orm.Column("text")
    public readonly content!: string;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    @orm.DeleteDateColumn()
    public readonly deleted_at!: Date | null;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.ManyToMany(
        () => AttachmentFile,
        () => BbsArticleCommentFile,
        (router) => router.file,
        (router) => router.comment,
        (x, y) => x.router.sequence - y.router.sequence,
    )
    public readonly files!: safe.Has.ManyToMany<
        AttachmentFile,
        BbsArticleCommentFile
    >;
}
