import api from "../api";
import { Configuration } from "../Configuration";
import { SGlobal } from "../SGlobal";

import { IPerformance } from "../api/structures/monitors/IPerformance";
import { ISystem } from "../api/structures/monitors/ISystem";

async function main(): Promise<void>
{
    // CONFIGURE MODE
    if (process.argv[2])
        SGlobal.setMode(process.argv[2].toUpperCase() as typeof SGlobal.mode);

    // GET PERFORMANCE & SYSTEM INFO
    const connection: api.IConnection = {
        host: `http://${Configuration.MASTER_IP}:${Configuration.API_PORT}`,
        encryption: Configuration.ENCRYPTION_PASSWORD
    };
    const performance: IPerformance = await api.functional.monitors.performance.get(connection);
    const system: ISystem = await api.functional.monitors.system.get(connection);
    
    // TRACE THEM
    console.log({ performance, system });
}
main().catch(exp =>
{
    console.log(exp);
    process.exit(-1);
});