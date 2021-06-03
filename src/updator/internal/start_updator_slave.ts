import { MutexConnector } from "mutex-server";

import { Configuration } from "../../Configuration";
import { Updator } from "./Updator";

export async function start_updator_slave(host: string): Promise<MutexConnector<string, Updator>>
{
    const updator: Updator = new Updator();
    const connector: MutexConnector<string, Updator> = new MutexConnector(Configuration.SYSTEM_PASSWORD, updator);
    await connector.connect(`ws://${host}:${Configuration.UPDATOR_PORT}/slave`);
    return connector;
}