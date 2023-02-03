import { DynamicExecutor } from "@nestia/e2e";
import mutex from "mutex-server";
import { sleep_for } from "tstl/thread/global";

import { SGlobal } from "../SGlobal";
import { MapUtil } from "../utils/MapUtil";

export namespace Scheduler {
    export async function repeat(): Promise<never> {
        const critical: mutex.MutexConnector<string, null> =
            await SGlobal.critical.get();
        const mutex: mutex.RemoteMutex = await critical.getMutex("scheduler");
        await mutex.lock();

        const dict: Map<string, number> = new Map();
        await once(dict, Date.now());

        while (true) {
            await sleep_for(INTERVAL);
            await once(dict, INTERVAL);
        }
    }

    async function once(
        dict: Map<string, number>,
        interval: number,
    ): Promise<void> {
        await DynamicExecutor.assert({
            prefix: "schedule",
            parameters: (key) => [MapUtil.take(dict, key, () => interval)],
            wrapper: async (key, closure) => {
                const slept: number = MapUtil.take(dict, key, () => interval);
                if ((await closure(slept)) === false)
                    dict.set(key, slept + interval);
            },
        })(__dirname + "/features");
    }
}

const INTERVAL = 60_000;
