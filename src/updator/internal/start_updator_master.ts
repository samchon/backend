import { MutexAcceptor, MutexServer } from "mutex-server";
import { HashSet } from "tstl/container/HashSet";

import { Configuration } from "../../Configuration";
import { IUpdateController } from "./IUpdateController";

export async function start_updator_master(): Promise<
    MutexServer<string, IUpdateController | null>
> {
    // PREPARE ASSETS
    const server: MutexServer<string, IUpdateController | null> =
        new MutexServer();
    const slaveSet: HashSet<MutexAcceptor<string, any>> = new HashSet();
    const provider: IUpdateController = {
        update: async () => {
            await Promise.all(
                [...slaveSet].map(async (slave) => {
                    try {
                        await slave.getDriver<IUpdateController>().update();
                    } catch {}
                }),
            );
        },
        revert: async (id: string) => {
            await Promise.all(
                [...slaveSet].map(async (slave) => {
                    try {
                        await slave.getDriver<IUpdateController>().revert(id);
                    } catch {}
                }),
            );
        },
    };

    // OPEN SERVER
    await server.open(await Configuration.UPDATOR_PORT(), async (acceptor) => {
        if (acceptor.header !== (await Configuration.SYSTEM_PASSWORD())) {
            await acceptor.reject();
            return;
        } else if (acceptor.path === "/slave") {
            await acceptor.accept(null);

            slaveSet.insert(acceptor);
            acceptor
                .join()
                .then(() => slaveSet.erase(acceptor))
                .catch(() => {});
        } else if (acceptor.path === "/api") await acceptor.accept(null);
        else if (acceptor.path === "/update") await acceptor.accept(provider);
    });
    return server;
}
