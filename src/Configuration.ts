/* eslint-disable */
import { IEncryptionPassword } from "@nestia/fetcher";
import pg from "pg";
import safe from "safe-typeorm";

import { SGlobal } from "./SGlobal";
import "./configure/ExceptionConfiguration";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

export namespace Configuration {
    export let API_PORT = async () => 37001;
    export let UPDATOR_PORT = async () => 37000;
    export let MASTER_IP = async (): Promise<string> => {
        if (SGlobal.mode === "LOCAL") return "127.0.0.1";
        else if (SGlobal.mode === "DEV") return "YOUR-DEV-SERVER-HOST";
        else return "YOUR-REAL-SERVER-HOST";
    };

    export let DB_CONFIG = async () => {
        pg.types.setTypeParser(20, parseInt);
        return {
            // CONNECTION INFO
            type: "postgres" as const,
            host: SGlobal.mode === "REAL" ? "YOUR-REAL-DB-HOST" : "127.0.0.1",
            username: "DB_ACCOUNT_w",
            readonlyUsername: "DB_ACCOUNT_r",
            password: await Configuration.SYSTEM_PASSWORD(),
            database: "DB_NAME",
            schema: "DB_SCHEMA",

            // OPTIONS
            namingStrategy: new safe.SnakeCaseStrategy(),
            entities: [
                `${__dirname}/models/tables/**/*.${EXTENSION}`,
                `${__dirname}/models/material/**/*.${EXTENSION}`,
            ],
        };
    };

    export let ENCRYPTION_PASSWORD = async (): Promise<
        Readonly<IEncryptionPassword>
    > => ({
        key: "pJXhbHlYfzkC1CBK8R67faaBgJWB9Myu",
        iv: "IXJBt4MflFxvxKkn",
    });

    export let SYSTEM_PASSWORD = async () => "https://github.com/samchon";

    /**
     * @internal
     */
    export const ASSETS = __dirname + "/../assets";
}
