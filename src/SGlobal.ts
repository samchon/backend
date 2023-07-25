import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { MutexConnector } from "mutex-server";
import { Singleton } from "tstl";
import { MutableSingleton } from "tstl/thread/MutableSingleton";
import typia from "typia";

import { Configuration } from "./Configuration";

/**
 * Global variables of the server.
 *
 * @author Samchon
 */
export class SGlobal {
    public static testing: boolean = false;

    /**
     * Current mode.
     *
     *   - LOCAL: The server is on your local machine.
     *   - DEV: The server is for the developer.
     *   - REAL: The server is for the real service.
     */
    public static get mode(): "LOCAL" | "DEV" | "REAL" {
        return (modeWrapper.value ??= this.env_.get().MODE);
    }

    /**
     * Set current mode.
     *
     * @param mode The new mode
     */
    public static setMode(mode: typeof SGlobal.mode): void {
        typia.assert<typeof mode>(mode);
        modeWrapper.value = mode;
    }

    public static readonly critical: MutableSingleton<
        MutexConnector<string, null>
    > = new MutableSingleton(async () => {
        const connector: MutexConnector<string, null> = new MutexConnector(
            Configuration.SYSTEM_PASSWORD(),
            null,
        );
        await connector.connect(
            `ws://${Configuration.MASTER_IP()}:${Configuration.UPDATOR_PORT()}/api`,
        );
        return connector;
    });

    public static get env(): IEnvironments {
        return this.env_.get();
    }

    private static env_ = new Singleton(() => {
        const env = dotenv.config();
        dotenvExpand.expand(env);
        return typia.assert<IEnvironments>(process.env);
    });
}

interface IMode {
    value?: "LOCAL" | "DEV" | "REAL";
}
const modeWrapper: IMode = {};

interface IEnvironments {
    MODE: "LOCAL" | "DEV" | "REAL";
    UPDATOR_PORT: `${number}`;
    API_PORT: `${number}`;
    API_ENCRYPTION_KEY: string;
    API_ENCRYPTION_IV: string;
    /**
     * @format ip
     */
    MASTER_IP: string;
    SYSTEM_PASSWORD: string;

    DB_HOST: string;
    DB_NAME: string;
    DB_SCHEMA: string;
    DB_USERNAME: string;
    DB_USERNAME_READONLY: string;
    DB_PASSWORD: string;
}
