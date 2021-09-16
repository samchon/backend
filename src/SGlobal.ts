import { MutexConnector } from "mutex-server";
import { MutableSingleton } from "tstl/thread/MutableSingleton";
import { assertType } from "typescript-is";

import { Configuration } from "./Configuration";

/**
 * Global variables of the server.
 * 
 * @author Samchon
 */
export class SGlobal
{
    /**
     * Current mode.
     * 
     *   - LOCAL: The server is on your local machine.
     *   - DEV: The server is for the developer.
     *   - REAL: The server is for the real service.
     */
    public static get mode(): "LOCAL" | "DEV" | "REAL"
    {
        return mode_;
    }

    /**
     * Set current mode.
     * 
     * @param mode The new mode
     */
    public static setMode(mode: typeof SGlobal.mode): void
    {
        assertType<typeof mode>(mode);
        mode_ = mode;
    }
}

export namespace SGlobal
{
    export const critical: MutableSingleton<MutexConnector<string, null>> = new MutableSingleton(async () =>
    {
        const connector: MutexConnector<string, null> = new MutexConnector(Configuration.SYSTEM_PASSWORD, null);
        await connector.connect(`ws://${Configuration.MASTER_IP}:${Configuration.UPDATOR_PORT}/api`);
        return connector;
    });
}

let mode_: "LOCAL" | "DEV" | "REAL" = "LOCAL";