/**
 * @packageDocumentation
 * @module models.tables.common
 */
//================================================================
import * as orm from "typeorm";
import safe from "safe-typeorm";

@orm.Entity()
export class Citizen extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @safe.EncryptedColumn("varchar", { 
        unique: true,
        password: () => Citizen.ENCRYPTION_PASSWORD
    })
    public readonly mobile!: string;

    @safe.EncryptedColumn("varchar", {
        index: true,
        password: () => Citizen.ENCRYPTION_PASSWORD
    })
    public readonly name!: string;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;
}

export namespace Citizen
{
    export const ENCRYPTION_PASSWORD =
    {
        key: "QC18iDPsscjf9w7xwAO1Vs8XoBgVBiZO",
        iv: "dbZl5MX4kOpjexIa"
    };
}