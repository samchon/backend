import fs from "fs";
import { randint } from "tstl/algorithm/random";
import { Singleton } from "tstl/thread/Singleton";

import { Backend } from "../Backend";
import { SGlobal } from "../SGlobal";
import { Scheduler } from "../schedulers/Scheduler";
import { ErrorUtil } from "../utils/ErrorUtil";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support/register");

const directory = new Singleton(async () => {
    await mkdir(`${__dirname}/../../assets`);
    await mkdir(`${__dirname}/../../assets/logs`);
    await mkdir(`${__dirname}/../../assets/logs/errors`);
});

function cipher(val: number): string {
    if (val < 10) return "0" + val;
    else return String(val);
}

async function mkdir(path: string): Promise<void> {
    try {
        await fs.promises.mkdir(path);
    } catch {}
}

async function handle_error(exp: any): Promise<void> {
    try {
        const date: Date = new Date();
        const fileName: string = `${date.getFullYear()}${cipher(
            date.getMonth() + 1,
        )}${cipher(date.getDate())}${cipher(date.getHours())}${cipher(
            date.getMinutes(),
        )}${cipher(date.getSeconds())}.${randint(0, Number.MAX_SAFE_INTEGER)}`;
        const content: string = JSON.stringify(ErrorUtil.toJSON(exp), null, 4);

        await directory.get();
        await fs.promises.writeFile(
            `${__dirname}/../../assets/logs/errors/${fileName}.log`,
            content,
            "utf8",
        );
    } catch {}
}

async function main(): Promise<void> {
    // BACKEND SEVER LATER
    const backend: Backend = new Backend();
    await backend.open();

    //----
    // POST-PROCESSES
    //----
    // UNEXPECTED ERRORS
    global.process.on("uncaughtException", handle_error);
    global.process.on("unhandledRejection", handle_error);

    // SCHEDULER ONLY WHEN MASTER
    if (SGlobal.env.MODE !== "REAL" || process.argv[3] === "master")
        await Scheduler.repeat();
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
