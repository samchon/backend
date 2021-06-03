const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js")
    require("source-map-support/register");

import cli from "cli";
import fs from  "fs";
import { StopWatch } from "./StopWatch";

interface ICommand
{
    include?: string;
    exclude?: string;
}
type IModule<Arguments extends any[]> = 
{
    [key: string]: (...args: Arguments) => Promise<void>;
};

export namespace DynamicImportIterator
{
    export async function main<Arguments extends any[]>
        (path: string, prefix: string, useCommand: boolean, ...args: Arguments): Promise<void>
    {
        let command: ICommand;
        if (useCommand === true)
            command = cli.parse();
        else
            command = {};

        await iterate(command, path, prefix, args);
    }

    export async function force<Arguments extends any[]>
        (path: string, prefix: string, useCommand: boolean, ...args: Arguments): Promise<Error[]>
    {
        let command: ICommand;
        if (useCommand === true)
            command = cli.parse();
        else
            command = {};

        const exceptions: Error[] = [];
        await iterate(command, path, prefix, args, exceptions);
        return exceptions;
    }

    async function iterate<Arguments extends any[]>
        (command: ICommand, path: string, prefix: string, args: Arguments, exceptions?: Error[]): Promise<void>
    {
        const directory: string[] = await fs.promises.readdir(path);
        for (const file of directory)
        {
            const current: string = `${path}/${file}`;
            const stats: fs.Stats = await fs.promises.lstat(current);

            if (stats.isDirectory() === true)
            {
                await iterate(command, current, prefix, args, exceptions);
                continue;
            }
            else if (file.substr(-3) !== `.${EXTENSION}`)
                continue;

            const external: IModule<Arguments> = await import(current);
            await execute(command, prefix, args, external, exceptions);
        }
    }

    async function execute<Arguments extends any[]>
        (command: ICommand, prefix: string, args: Arguments, external: IModule<Arguments>, exceptions?: Error[]): Promise<void>
    {
        for (const key in external)
        {
            if (command.exclude && key.indexOf(command.exclude) !== -1)
                continue;
            else if (command.include && key.indexOf(command.include) === -1)
                continue;
            else if (key.substr(0, prefix.length) !== prefix)
                continue;
            else if (external[key] instanceof Function)
                try
                {
                    await StopWatch.trace(key, () => external[key](...args));
                }
                catch (exp)
                {
                    if (exceptions !== undefined)
                    {
                        console.log(exp.name);
                        exceptions.push(exp);
                    }
                    else
                        throw exp;
                }
        }
    }
}