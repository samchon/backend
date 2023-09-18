import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { MutexConnector } from "mutex-server";
import { MutableSingleton, Singleton } from "tstl";
import typia from "typia";

import { Configuration } from "./Configuration";

/**
 * Global variables of the server.
 *
 * @author Samchon
 */
export class SGlobal {
    public static testing: boolean = false;

    public static readonly prisma: PrismaClient = new PrismaClient();

    public static get env(): IEnvironments {
        return this.env_.get();
    }

    private static env_ = new Singleton(() => {
        const env = dotenv.config();
        dotenvExpand.expand(env);
        return typia.assert<IEnvironments>(process.env);
    });

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
}
interface IEnvironments {
    MODE: "LOCAL" | "DEV" | "REAL";
    UPDATOR_PORT: `${number}`;
    API_PORT: `${number}`;
    // MASTER_IP: string & (tags.Format<"ipv4"> | tags.Format<"ipv6">);
    SYSTEM_PASSWORD: string;

    POSTGRES_HOST: string;
    POSTGRES_PORT: `${number}`;
    POSTGRES_DATABASE: string;
    POSTGRES_SCHEMA: string;
    POSTGRES_USERNAME: string;
    POSTGRES_USERNAME_READONLY: string;
    POSTGRES_PASSWORD: string;
}

interface IMode {
    value?: "LOCAL" | "DEV" | "REAL";
}
const modeWrapper: IMode = {};
