import * as os from "os";
import { HashMap } from "tstl/container/HashMap";
import { sleep_for } from "tstl/thread/global";

import api from "../../api";
import { Configuration } from "../../Configuration";

import { ArrayUtil } from "../../utils/ArrayUtil";
import { Terminal } from "../../utils/Terminal";

import { ISystem } from "../../api/structures/monitors/ISystem";

async function main(): Promise<void>
{
    //----
    // PREPARATIONS
    //----
    // START UPDATOR SERVER
    await Terminal.execute("npm run start:updator:master");
    await sleep_for(1000);

    // START BACKEND SERVER
    await Terminal.execute("npm run start local xxxx yyyy zzzz");
    await sleep_for(4000);

    // API LIBRARY
    const connection: api.IConnection = {
        host: `http://127.0.0.1:${Configuration.API_PORT}`,
        encryption: Configuration.ENCRYPTION_PASSWORD
    };
    
    sleep_for(1000).then(async () => 
    {
        console.log("Start updating");
        await Terminal.execute("npm run update");
        console.log("The update has been completed");
    });

    const dict: HashMap<number, number> = new HashMap();
    let index: number = 0;

    try
    {
        await Promise.all(ArrayUtil.repeat(600, async i =>
        {
            await sleep_for(i * 100);
            const system: ISystem = await api.functional.monitors.system.sleep(connection, 3000);

            const it: HashMap.Iterator<number, number> = dict.find(system.uid);
            if (it.equals(dict.end()) === true)
                dict.emplace(system.uid, ++index);
        }));
        if (dict.size() !== os.cpus().length * 2)
        {
            console.log(dict.size(), os.cpus().length);
            throw new Error("Bug on updator: failed to reloading.");
        }
    }
    catch (exp)
    {
        throw exp;
    }
    await Terminal.execute("npm run stop");
    await Terminal.execute("npm run stop:updator:master");
}
main();