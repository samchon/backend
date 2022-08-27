import { MutexConnector, RemoteMutex } from "mutex-server";
import { Promisive } from "tgrid/typings/Promisive";
import { UniqueLock } from "tstl/thread/UniqueLock";

import api from "@ORGANIZATION/PROJECT-api";
import { ISystem } from "@ORGANIZATION/PROJECT-api/lib/structures/monitors/ISystem";

import { Configuration } from "../Configuration";
import { SGlobal } from "../SGlobal";
import { IUpdateController } from "../updator/internal/IUpdateController";

async function main(): Promise<void> {
    // CONFIGURE MODE
    if (!process.argv[2])
        throw new Error(
            "Error on ShoppingUpdator.update(): no mode specified.",
        );
    SGlobal.setMode(process.argv[2].toUpperCase() as typeof SGlobal.mode);

    // CONNECT TO THE UPDATOR SERVER
    const connector: MutexConnector<string, null> = new MutexConnector(
        await Configuration.SYSTEM_PASSWORD(),
        null,
    );
    await connector.connect(
        `ws://${await Configuration.MASTER_IP()}:${await Configuration.UPDATOR_PORT()}/update`,
    );

    // REQUEST UPDATE WITH MONOPOLYING A GLOBAL MUTEX
    const mutex: RemoteMutex = await connector.getMutex("update");
    const success: boolean = await UniqueLock.try_lock(mutex, async () => {
        const updator: Promisive<IUpdateController> = connector.getDriver();
        await updator.update();
    });
    await connector.close();

    // SUCCESS OR NOT
    if (success === false) {
        console.log("Already on updating.");
        process.exit(-1);
    }

    // PRINT THE COMMIT STATUS
    const connection: api.IConnection = {
        host: `http://${await Configuration.MASTER_IP()}:${await Configuration.API_PORT()}`,
        encryption: await Configuration.ENCRYPTION_PASSWORD(),
    };
    const system: ISystem = await api.functional.monitors.system.get(
        connection,
    );
    console.log("branch", system.arguments[2], system.commit.branch);
    console.log("hash", system.commit.hash);
    console.log("commit-time", system.commit.commited_at);
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
