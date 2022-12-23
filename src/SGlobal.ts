import { MutexConnector } from "mutex-server";
import { MutableSingleton } from "tstl/thread/MutableSingleton";
import { assert } from "typia";

import { Configuration } from "./Configuration";

/**
 * Global variables of the server.
 *
 * @author Samchon
 */
export class SGlobal {
    /**
     * Current mode.
     *
     *   - LOCAL: The server is on your local machine.
     *   - DEV: The server is for the developer.
     *   - REAL: The server is for the real service.
     */
    public static get mode(): "LOCAL" | "DEV" | "REAL" {
        return env.mode;
    }

    /**
     * Set current mode.
     *
     * @param mode The new mode
     */
    public static setMode(mode: typeof SGlobal.mode): void {
        assert<typeof mode>(mode);
        env.mode = mode;
    }
}

export namespace SGlobal {
    export const critical: MutableSingleton<MutexConnector<string, null>> =
        new MutableSingleton(async () => {
            const connector: MutexConnector<string, null> = new MutexConnector(
                await Configuration.SYSTEM_PASSWORD(),
                null,
            );
            await connector.connect(
                `ws://${await Configuration.MASTER_IP()}:${await Configuration.UPDATOR_PORT()}/api`,
            );
            return connector;
        });
}

interface IEnvironments {
    mode: "LOCAL" | "DEV" | "REAL";
}
const env: IEnvironments = {
    mode: "LOCAL",
};
