import * as orm from "typeorm";
import safe from "safe-typeorm";

import { AttachmentFile } from "../../misc/AttachmentFile";
import { BbsArticle } from "./BbsArticle";
import { BbsCommentFile } from "./BbsCommentFile";
import { BbsCustomer } from "../actors/BbsCustomer";
import { BbsManager } from "../actors/BbsManager";

import { ColumnType } from "../../../internal/ColumnType";

@orm.Entity()
export class BbsComment extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @safe.Belongs.ManyToOne(() => BbsArticle,
        article => article.comments,
        "uuid",
        "bbs_article_id",
        { index: true }
    )
    public readonly article!: safe.Belongs.ManyToOne<BbsArticle, "uuid">;

    @safe.Belongs.ManyToOne
    (
        () => BbsCustomer as safe.Model.Creator<BbsCustomer<true>>,
        customer => customer.comments,
        "uuid",
        "bbs_customer_id",
        { index: true, nullable: true }
    )
    public readonly customer!: safe.Belongs.ManyToOne<BbsCustomer<true>, "uuid", { nullable: true }>;

    @safe.Belongs.ManyToOne(() => BbsManager,
        manager => manager.comments,
        "uuid",
        "bbs_manager_id",
        { index: true, nullable: true }
    )
    public readonly manager!: safe.Belongs.ManyToOne<BbsManager, "uuid", { nullable: true }>;

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
        () => BbsCommentFile,
        router => router.file,
        router => router.comment,
        (x, y) => x.router.sequence < y.router.sequence
    )
    public readonly files!: safe.Has.ManyToMany<AttachmentFile, BbsCommentFile>;
}