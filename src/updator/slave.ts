import { Configuration } from "../Configuration";
import { SGlobal } from "../SGlobal";

import { start_updator_slave } from "./internal/start_updator_slave";

async function main(): Promise<void>
{
    // CONFIGURE MODE
    if (process.argv[2])
        SGlobal.setMode(process.argv[2].toUpperCase() as typeof SGlobal.mode);

    // START THE CLIENT
    await start_updator_slave(Configuration.MASTER_IP);
}
main().catch(exp =>
{
    console.log(exp);
    process.exit(-1);
});