import { MutexConnector } from "mutex-server";

import { MyConfiguration } from "../../MyConfiguration";
import { Updator } from "./Updator";

export async function start_updator_slave(
    host: string,
): Promise<MutexConnector<string, Updator>> {
    const updator: Updator = new Updator();
    const connector: MutexConnector<string, Updator> = new MutexConnector(
        MyConfiguration.SYSTEM_PASSWORD(),
        updator,
    );
    await connector.connect(
        `ws://${host}:${MyConfiguration.UPDATOR_PORT()}/slave`,
    );
    return connector;
}
