import { Promisive } from "tgrid/typings/Promisive";
import { MutexConnector, RemoteMutex } from "mutex-server";
import { UniqueLock } from "tstl/thread/UniqueLock";

import { IUpdateController } from "../updator/internal/IUpdateController";

import { Configuration } from "../Configuration";
import { SGlobal } from "../SGlobal";

async function main(): Promise<void>
{
    // CONFIGURE MODE
    if (process.argv[2])
        SGlobal.setMode(process.argv[2].toUpperCase() as typeof SGlobal.mode);

    // CONNECT TO THE UPDATOR SERVER
    const connector: MutexConnector<string, null> = new MutexConnector(Configuration.SYSTEM_PASSWORD, null);
    await connector.connect(`ws://${Configuration.MASTER_IP}:${Configuration.UPDATOR_PORT}/update`);

    // REQUEST UPDATE WITH MONOPOLYING A GLOBAL MUTEX
    const mutex: RemoteMutex = await connector.getMutex("update");
    const success: boolean = await UniqueLock.try_lock(mutex, async () =>
    {
        const updator: Promisive<IUpdateController> = connector.getDriver();
        await updator.update();
    });

    // SUCCESS OR NOT
    if (success === false)
        console.log("Already on updating.");

    // TEERMINATE
    await connector.close();
    process.exit(success ? 0 : -1);
}
main().catch(exp =>
{
    console.log(exp);
    process.exit(-1);
});