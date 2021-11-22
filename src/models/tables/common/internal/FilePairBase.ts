/**
 * @packageDocumentation
 * @module models.tables.common
 */
//================================================================
import * as orm from "typeorm";
import safe from "safe-typeorm";

import { AttachmentFile } from "../AttachmentFile";

export abstract class FilePairBase 
    extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @safe.Belongs.ManyToOne(() => AttachmentFile, 
        "uuid",
        "attachment_file_id", 
        { index: true }
    )
    public readonly file!: safe.Belongs.ManyToOne<AttachmentFile, "uuid">;

    @orm.Column("int")
    public readonly sequence!: number;
}