import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { Singleton } from "tstl";
import typia from "typia";

interface IEnvironments {
  MODE: "local" | "dev" | "real";
  API_PORT: `${number}`;
  SYSTEM_PASSWORD: string;

  POSTGRES_URL: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: `${number}`;
  POSTGRES_DATABASE: string;
  POSTGRES_SCHEMA: string;
  POSTGRES_USERNAME: string;
  POSTGRES_USERNAME_READONLY: string;
  POSTGRES_PASSWORD: string;
}
const envSingleton = new Singleton(() => {
  const env = dotenv.config();
  dotenvExpand.expand(env);
  return typia.assert<IEnvironments>(process.env);
});
const prismaSingleton = new Singleton(
  () =>
    new PrismaClient({
      adapter: new PrismaPg(
        { connectionString: envSingleton.get().POSTGRES_URL },
        { schema: envSingleton.get().POSTGRES_SCHEMA },
      ),
    }),
);

/**
 * Global variables of the server.
 *
 * @author Samchon
 */
export class MyGlobal {
  public static testing: boolean = false;

  public static get prisma(): PrismaClient {
    return prismaSingleton.get();
  }
  public static get env(): IEnvironments {
    return envSingleton.get();
  }

  /**
   * Current mode.
   *
   *   - local: The server is on your local machine.
   *   - dev: The server is for the developer.
   *   - real: The server is for the real service.
   */
  public static get mode(): "local" | "dev" | "real" {
    return (modeWrapper.value ??= envSingleton.get().MODE);
  }

  /**
   * Set current mode.
   *
   * @param mode The new mode
   */
  public static setMode(mode: typeof MyGlobal.mode): void {
    typia.assert<typeof mode>(mode);
    modeWrapper.value = mode;
  }
}

interface IMode {
  value?: "local" | "dev" | "real";
}
const modeWrapper: IMode = {};
