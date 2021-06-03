import * as orm from "typeorm";
import { BbsAdministratorSeeder } from "./seeders/bbs/actors/BbsAdministratorSeeder";

export namespace SetupWizard
{
    export async function schema(connection: orm.Connection): Promise<void>
    {
        await connection.dropDatabase();
        await connection.synchronize();
    }
    
    export async function seed(): Promise<void>
    {
        await BbsAdministratorSeeder.seed();
    }
}