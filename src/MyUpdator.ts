import { MutexAcceptor, MutexConnector, MutexServer } from "mutex-server";
import { HashSet } from "tstl";

import { MyConfiguration } from "./MyConfiguration";
import { Terminal } from "./utils/Terminal";

export namespace MyUpdator {
  export interface IController {
    update: () => Promise<void>;
    revert: (commit: string) => Promise<void>;
  }

  export const master = async (): Promise<
    MutexServer<string, IController | null>
  > => {
    // PREPARE ASSETS
    const server: MutexServer<string, IController | null> = new MutexServer();
    const clientSet: HashSet<MutexAcceptor<string, any>> = new HashSet();
    const process = async (
      job: (driver: IController) => Promise<void>,
    ): Promise<void> => {
      const clientList: MutexAcceptor<string, any>[] = [...clientSet];
      const tasks: Promise<void>[] = clientList.map(async (client) => {
        try {
          await job(client.getDriver<IController>());
        } catch {}
      });
      await Promise.all(tasks);
    };

    const provider: IController = {
      update: () => process((driver) => driver.update()),
      revert: (commit: string) => process((driver) => driver.revert(commit)),
    };

    // OPEN SERVER
    await server.open(MyConfiguration.UPDATOR_PORT(), async (acceptor) => {
      if (acceptor.header !== MyConfiguration.SYSTEM_PASSWORD()) {
        await acceptor.reject();
        return;
      } else if (acceptor.path === "/slave") {
        await acceptor.accept(null);

        clientSet.insert(acceptor);
        acceptor
          .join()
          .then(() => clientSet.erase(acceptor))
          .catch(() => {});
      } else if (acceptor.path === "/api") await acceptor.accept(null);
      else if (acceptor.path === "/update") await acceptor.accept(provider);
    });
    return server;
  };

  export const slave = async (
    host?: string,
  ): Promise<MutexConnector<string, IController>> => {
    const connector: MutexConnector<string, IController> = new MutexConnector(
      MyConfiguration.SYSTEM_PASSWORD(),
      UpdateProvider,
    );
    await connector.connect(
      `ws://${
        host ?? MyConfiguration.MASTER_IP()
      }:${MyConfiguration.UPDATOR_PORT()}/slave`,
    );
    return connector;
  };
}

namespace UpdateProvider {
  export const update = async (): Promise<void> => {
    // REFRESH REPOSITORY
    await Terminal.execute("git pull");
    await Terminal.execute("npm install");
    await Terminal.execute("npm run build");

    // RELOAD PM2
    await Terminal.execute("npm run start:reload");
  };

  export const revert = async (commit: string): Promise<void> => {
    // REVERT REPOSITORY
    await Terminal.execute("git pull");
    await Terminal.execute(`git reset --hard ${commit}`);
    await Terminal.execute("npm install");
    await Terminal.execute("npm run build");

    // RELOAD PM2
    await Terminal.execute("npm run start:reload");
  };
}
