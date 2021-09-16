import { MutexServer, MutexAcceptor } from "mutex-server";
import { HashSet } from "tstl/container/HashSet";

import { IUpdateController } from "./IUpdateController";
import { Configuration } from "../../Configuration";

export async function start_updator_master(): Promise<MutexServer<string, IUpdateController | null>>
{
    // PREPARE ASSETS
    const server: MutexServer<string, IUpdateController | null> = new MutexServer();
    const clientSet: HashSet<MutexAcceptor<string, any>> = new HashSet();
    const provider: IUpdateController = 
    {
        update: async () =>
        {
            for (const client of [...clientSet])
                try
                {
                    await client.getDriver<IUpdateController>().update();
                }
                catch 
                {}
        }
    };

    // OPEN SERVER
    await server.open(Configuration.UPDATOR_PORT, async acceptor =>
    {
        if (acceptor.header !== Configuration.SYSTEM_PASSWORD)
        {
            await acceptor.reject();
            return;
        }
        else if (acceptor.path === "/slave")
        {
            await acceptor.accept(null);

            clientSet.insert(acceptor);
            acceptor.join()
                .then(() => clientSet.erase(acceptor))
                .catch(() => {});
        }
        else if (acceptor.path === "/api")
            await acceptor.accept(null);
        else if (acceptor.path === "/update")
            await acceptor.accept(provider);
    });
    return server;
}