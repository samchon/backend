import nest from "@modules/nestjs";
import core from "@nestia/core";
import { sleep_for } from "tstl/thread/global";

import { ISystem } from "@ORGANIZATION/PROJECT-api/lib/structures/monitors/ISystem";

import { SystemProvider } from "../../providers/monitors/SystemProvider";

import { DateUtil } from "../../utils/DateUtil";

@nest.Controller("monitors/system")
export class SystemController {
    @core.EncryptedRoute.Get()
    public async get(): Promise<ISystem> {
        return {
            uid: SystemProvider.uid,
            arguments: process.argv,
            commit: await SystemProvider.commit(),
            package: await SystemProvider.package(),
            created_at: DateUtil.to_string(SystemProvider.created_at, true),
        };
    }

    @core.EncryptedRoute.Get(":ms")
    public async sleep(
        @core.TypedParam("ms", "number") ms: number,
    ): Promise<ISystem> {
        await sleep_for(ms);
        return await this.get();
    }

    /**
     * @internal
     */
    @core.EncryptedRoute.Get("internal_server_error")
    public async internal_server_error(): Promise<void> {
        throw new Error("The manual 500 error for the testing.");
    }

    /**
     * @internal
     */
    @core.EncryptedRoute.Get("uncaught_exception")
    public uncaught_exception(): void {
        new Promise(() => {
            throw new Error("The manul uncaught exception for the testing.");
        }).catch(() => {});
    }
}
