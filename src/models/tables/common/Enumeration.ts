/**
 * @packageDocumentation
 * @module models.tables.common
 */
//================================================================
import safe from "safe-typeorm";
import * as orm from "typeorm";

@orm.Unique(["group", "code"])
@orm.Entity()
export class Enumeration
    extends safe.Model
{
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @orm.Column("varchar")
    public readonly group!: string;

    @orm.Column("varchar")
    public readonly code!: string;

    @orm.Column("varchar")
    public readonly name!: string;
}