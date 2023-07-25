import core from "@nestia/core";
import { NestFactory } from "@nestjs/core";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { Configuration } from "./Configuration";
import { SGlobal } from "./SGlobal";

export class Backend {
    private application_?: NestFastifyApplication;

    public async open(): Promise<void> {
        //----
        // OPEN THE BACKEND SERVER
        //----
        // MOUNT CONTROLLERS
        this.application_ = await NestFactory.create(
            await core.EncryptedModule.dynamic(
                __dirname + "/controllers",
                Configuration.ENCRYPTION_PASSWORD(),
            ),
            new FastifyAdapter(),
            { logger: false },
        );

        // DO OPEN
        this.application_.enableCors();
        await this.application_.listen(Configuration.API_PORT());

        //----
        // POST-PROCESSES
        //----
        // INFORM TO THE PM2
        if (process.send) process.send("ready");

        // WHEN KILL COMMAND COMES
        process.on("SIGINT", async () => {
            await this.close();
            process.exit(0);
        });
    }

    public async close(): Promise<void> {
        if (this.application_ === undefined) return;

        // DO CLOSE
        await this.application_.close();
        delete this.application_;

        // EXIT FROM THE CRITICAL-SERVER
        if ((await SGlobal.critical.is_loaded()) === true) {
            const critical = await SGlobal.critical.get();
            await critical.close();
        }
    }
}
