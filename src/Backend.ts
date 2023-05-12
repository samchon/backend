import core from "@nestia/core";
import { NestFactory } from "@nestjs/core";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import cp from "child_process";
import fs from "fs";

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
                await Configuration.ENCRYPTION_PASSWORD(),
            ),
            new FastifyAdapter(),
            { logger: false },
        );

        // DO OPEN
        this.application_.enableCors();
        if (SGlobal.testing === false) await this.swagger(this.application_);
        await this.application_.listen(await Configuration.API_PORT());

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

    private async swagger(app: NestFastifyApplication): Promise<void> {
        // CREATE DIRECTORY
        const location: string = `${Configuration.PROJECT_DIR}/dist`;
        if (fs.existsSync(location) === false)
            await fs.promises.mkdir(location);

        // BUILD SWAGGER
        cp.execSync("npm run build:swagger");

        // OPEN SWAGGER
        await app.register(await import("@fastify/swagger"), {
            mode: "static",
            specification: {
                path: `${location}/swagger.json`,
                baseDir: process.cwd(),
            },
        });
        await app.register(await import("@fastify/swagger-ui"), {
            routePrefix: "/docs",
        });
    }
}
