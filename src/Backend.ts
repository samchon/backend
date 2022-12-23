import nest from "@modules/nestjs";
import core from "@nestia/core";
import { NestFactory } from "@nestjs/core";
import express from "express";

import { Configuration } from "./Configuration";
import { SGlobal } from "./SGlobal";

export class Backend {
    private application_?: nest.INestApplication;
    private is_closing_: boolean = false;

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
            { logger: false },
        );

        // CONFIGURATIONS
        this.is_closing_ = false;
        this.application_.enableCors();
        this.application_.use(this.middleware.bind(this));

        // DO OPEN
        await this.application_.listen(await Configuration.API_PORT());

        //----
        // POST-PROCESSES
        //----
        // INFORM TO THE PM2
        if (process.send) process.send("ready");

        // WHEN KILL COMMAND COMES
        process.on("SIGINT", async () => {
            this.is_closing_ = true;
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

    private middleware(
        _request: express.Request,
        response: express.Response,
        next: FunctionLike,
    ): void {
        if (this.is_closing_ === true) response.set("Connection", "close");
        next();
    }
}

type FunctionLike = (...args: any[]) => any;
