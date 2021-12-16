import cli from "cli";
import * as orm from "typeorm";
import { Backend } from "../Backend";

import api from "../api";

import { Configuration } from "../Configuration";
import { SGlobal } from "../SGlobal";

import { DynamicImportIterator } from "./internal/DynamicImportIterator";
import { SetupWizard } from "../setup/SetupWizard";
import { StopWatch } from "./internal/StopWatch";
import { MutexServer } from "mutex-server";
import { start_updator_master } from "../updator/internal/start_updator_master";
import { IUpdateController } from "../updator/internal/IUpdateController";

interface ICommand
{
    mode?: string;
    skipReset?: string;
}

async function main(): Promise<void>
{
    // SPECIALIZE MODE
    const command: ICommand = cli.parse();
    if (command.mode)
        SGlobal.setMode(command.mode.toUpperCase() as typeof SGlobal.mode);

    // PREPARE DATABASE
    const db: orm.Connection = await orm.createConnection(Configuration.DB_CONFIG);
    if (command.skipReset === undefined)
    {
        await StopWatch.trace("Reset DB", () => SetupWizard.schema(db));
        await StopWatch.trace("Seed Data", () => SetupWizard.seed());
    }

    // UPDATOR SERVER
    const updator: MutexServer<string, IUpdateController | null> = await start_updator_master();

    // BACKEND SERVER
    const backend: Backend = new Backend();
    await backend.open(Configuration.API_PORT);

    //----
    // CLINET CONNECTOR
    //----
    // CONNECTION INFO
    const connection: api.IConnection = {
        host: `http://127.0.0.1:${Configuration.API_PORT}`,
        encryption: Configuration.ENCRYPTION_PASSWORD
    };

    // DO TEST
    const exceptions: Error[] = await DynamicImportIterator.force
    (
        __dirname + "/features", 
        {
            prefix: "test", 
            parameters: [connection]
        }
    );

    // TERMINATE
    await backend.close();
    await db.close();
    await updator.close();

    if (exceptions.length === 0)
        console.log("Success");
    else
    {
        for (const exp of exceptions)
            console.log(exp);
        process.exit(-1);
    }
}
main().catch(exp =>
{
    console.log(exp);
    process.exit(-1);
});