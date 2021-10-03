import { sleep_for } from "tstl/thread/global";
import { SGlobal } from "../SGlobal";
import { DynamicImportIterator } from "../test/internal/DynamicImportIterator";

export namespace Scheduler
{
    export async function repeat(): Promise<void>
    {
        const critical = await SGlobal.critical.get();
        const mutex = await critical.getMutex("scheduler");

        if (await mutex.try_lock() === false)
            return;

        let time: number = 0;
        while (true)
        {
            const now: number = Date.now();
            const interval: number = now - time;
            time = now;

            await DynamicImportIterator.main(__dirname + "/features", 
            {
                prefix: "schedule", 
                parameters: [ interval ]
            });
            await sleep_for(INTERVAL);
        }
    }
}

const INTERVAL = 60_000;