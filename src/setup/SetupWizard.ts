import * as orm from "typeorm";

export namespace SetupWizard
{
    export async function schema(connection: orm.Connection): Promise<void>
    {
        await connection.dropDatabase();
        await connection.synchronize();
    }
    
    export async function seed(): Promise<void>
    {
        
    }
}