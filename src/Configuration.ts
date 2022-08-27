import { IEncryptionPassword } from "nestia-fetcher";
import pg from "pg";
import safe from "safe-typeorm";

import { SGlobal } from "./SGlobal";
import "./configure/ExceptionConfiguration";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

export class Configuration {
    public static get MASTER_IP(): string {
        if (SGlobal.mode === "LOCAL") return "127.0.0.1";
        else if (SGlobal.mode === "DEV") return "YOUR-DEV-SERVER-HOST";
        else return "YOUR-REAL-SERVER-HOST";
    }

    public static get DB_CONFIG() {
        pg.types.setTypeParser(20, parseInt);
        return {
            // CONNECTION INFO
            type: "postgres" as const,
            host: SGlobal.mode === "REAL" ? "YOUR-REAL-DB-HOST" : "127.0.0.1",
            username: "DB_ACCOUNT_w",
            readonlyUsername: "DB_ACCOUNT_r",
            password: Configuration.SYSTEM_PASSWORD,
            database: "DB_NAME",
            schema: "DB_SCHEMA",

            // OPTIONS
            namingStrategy: new safe.SnakeCaseStrategy(),
            entities: [`${__dirname}/models/**/*.${EXTENSION}`],
        };
    }
}

export namespace Configuration {
    export const API_PORT = 37001;
    export const UPDATOR_PORT = 37000;

    export const ENCRYPTION_PASSWORD: Readonly<IEncryptionPassword> = {
        key: "pJXhbHlYfzkC1CBK8R67faaBgJWB9Myu",
        iv: "IXJBt4MflFxvxKkn",
    };

    export const ASSETS = __dirname + "/../assets";
    export const CREATED_AT: Date = new Date();
    export const SYSTEM_PASSWORD: string = "https://github.com/samchon";
}
