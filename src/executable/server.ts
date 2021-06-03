const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js")
    require("source-map-support/register");

import * as fs from "fs";
import * as orm from "typeorm";
import { Singleton } from "tstl/thread/Singleton";
import { randint } from "tstl/algorithm/random";

import { Backend } from "../Backend";
import { Configuration } from "../Configuration";
import { SGlobal } from "../SGlobal";

import { ErrorUtil } from "../utils/ErrorUtil";

const directory = new Singleton(async () =>
{
    await mkdir(`${__dirname}/../../assets`); 
    await mkdir(`${__dirname}/../../assets/logs`); 
    await mkdir(`${__dirname}/../../assets/logs/errors`); 
});

function cipher(val: number): string
{
    if (val < 10)
        return "0" + val;
    else
        return String(val);
}

async function mkdir(path: string): Promise<void>
{
    try 
    {
        await fs.promises.mkdir(path); 
    }
    catch {}
}

async function handle_error(exp: any): Promise<void>
{
    try
    {
        const date: Date = new Date();
        const fileName: string = `${date.getFullYear()}${cipher(date.getMonth()+1)}${cipher(date.getDate())}${cipher(date.getHours())}${cipher(date.getMinutes())}${cipher(date.getSeconds())}.${randint(0, Number.MAX_SAFE_INTEGER)}`;
        const content: string = JSON.stringify(ErrorUtil.toJSON(exp), null, 4);

        await directory.get();
        await fs.promises.writeFile(`${__dirname}/../../assets/logs/errors/${fileName}.log`, content, "utf8");
    }
    catch {}
}

async function main(): Promise<void>
{
    //----
    // OPEN SERVER
    //----
    // CONFIGURE MODE
    if (process.argv[2])
        SGlobal.setMode(process.argv[2].toUpperCase() as typeof SGlobal.mode);

    // CONNECT TO THE DB FIRST
    await orm.createConnection(Configuration.DB_CONFIG);
    
    // BACKEND SEVER LATER
    const backend: Backend = new Backend();
    await backend.open(Configuration.API_PORT);

    //----
    // POST-PROCESSES
    //----
    // UNEXPECTED ERRORS
    global.process.on("uncaughtException", handle_error);
    global.process.on("unhandledRejection", handle_error);
}
main();