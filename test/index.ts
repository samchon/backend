import orm from "@modules/typeorm";
import { DynamicExecutor, StopWatch } from "@nestia/e2e";
import { MutexServer } from "mutex-server";
import { sleep_for } from "tstl/thread/global";

import api from "@ORGANIZATION/PROJECT-api";

import { Backend } from "../src/Backend";
import { Configuration } from "../src/Configuration";
import { SGlobal } from "../src/SGlobal";
import { SetupWizard } from "../src/setup/SetupWizard";
import { IUpdateController } from "../src/updator/internal/IUpdateController";
import { start_updator_master } from "../src/updator/internal/start_updator_master";
import { ArgumentParser } from "./helpers/ArgumentParser";

interface IOptions {
    mode: string;
    reset: boolean;
    include?: string[];
    exclude?: string[];
}

const getOptions = () =>
    ArgumentParser.parse<IOptions>(async (command, prompt, action) => {
        command.option("--mode <string>", "target mode");
        command.option("--reset <true|false>", "reset local DB or not");
        command.option("--include <string...>", "include feature files");
        command.option("--exclude <string...>", "exclude feature files");

        return action(async (options) => {
            if (typeof options.reset === "string")
                options.reset = options.reset === "true";
            options.mode ??= await prompt.select("mode")("Select mode")([
                "LOCAL",
                "DEV",
                "REAL",
            ]);
            options.reset ??= await prompt.boolean("reset")("Reset local DB");
            return options as IOptions;
        });
    });

async function main(): Promise<void> {
    // SPECIALIZE MODE
    const options: IOptions = await getOptions();
    SGlobal.setMode(options.mode.toUpperCase() as typeof SGlobal.mode);

    // PREPARE DATABASE
    const db: orm.Connection = await orm.createConnection(
        Configuration.DB_CONFIG(),
    );
    if (options.reset !== false) {
        await StopWatch.trace("Reset DB")(() => SetupWizard.schema(db));
        await StopWatch.trace("Seed Data")(() => SetupWizard.seed());
    }

    // UPDATOR SERVER
    const updator: MutexServer<string, IUpdateController | null> =
        await start_updator_master();

    // BACKEND SERVER
    SGlobal.testing = true;
    const backend: Backend = new Backend();
    await backend.open();

    //----
    // CLINET CONNECTOR
    //----
    // DO TEST
    const connection: api.IConnection = {
        host: `http://127.0.0.1:${Configuration.API_PORT()}`,
        encryption: Configuration.ENCRYPTION_PASSWORD(),
    };
    const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
        prefix: "test",
        parameters: () => [
            {
                host: connection.host,
                encryption: connection.encryption,
            },
        ],
        filter: (func) =>
            (!options.include?.length ||
                (options.include ?? []).some((str) => func.includes(str))) &&
            (!options.exclude?.length ||
                (options.exclude ?? []).every((str) => !func.includes(str))),
    })(__dirname + "/features");

    // WAIT FOR A WHILE FOR THE EVENTS
    await sleep_for(2500);

    // TERMINATE
    await backend.close();
    await db.close();
    await updator.close();

    const failures: DynamicExecutor.IReport.IExecution[] =
        report.executions.filter((exec) => exec.error !== null);
    if (failures.length === 0) console.log("Success");
    else {
        for (const f of failures) console.log(f.error);
        process.exit(-1);
    }
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
