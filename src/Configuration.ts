/* eslint-disable */
import { IEncryptionPassword } from "@nestia/fetcher";
import path from "path";
import pg from "pg";
import safe from "safe-typeorm";

import { SGlobal } from "./SGlobal";
import "./configure/ExceptionConfiguration";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

export namespace Configuration {
    export const ROOT = (() => {
        const splitted: string[] = __dirname.split(path.sep);
        return splitted.at(-1) === "src" && splitted.at(-2) === "bin"
            ? path.resolve(__dirname + "/../..")
            : path.resolve(__dirname + "/..");
    })();

    export const API_PORT = () => Number(SGlobal.env.API_PORT);
    export const UPDATOR_PORT = () => Number(SGlobal.env.UPDATOR_PORT);
    export const MASTER_IP = () => SGlobal.env.MASTER_IP;

    export const DB_CONFIG = () => {
        pg.types.setTypeParser(20, parseInt);
        return {
            // CONNECTION INFO
            type: "postgres" as const,
            host: SGlobal.env.DB_HOST,
            username: SGlobal.env.DB_USERNAME,
            readonlyUsername: SGlobal.env.DB_USERNAME_READONLY,
            password: SGlobal.env.DB_PASSWORD,
            database: SGlobal.env.DB_NAME,
            schema: SGlobal.env.DB_SCHEMA,

            // OPTIONS
            namingStrategy: new safe.SnakeCaseStrategy(),
            entities: [
                `${__dirname}/models/tables/**/*.${EXTENSION}`,
                `${__dirname}/models/material/**/*.${EXTENSION}`,
            ],
        };
    };

    export const ENCRYPTION_PASSWORD = () =>
        <Readonly<IEncryptionPassword>>{
            key: SGlobal.env.API_ENCRYPTION_KEY,
            iv: SGlobal.env.API_ENCRYPTION_IV,
        };
    export const SYSTEM_PASSWORD = () => SGlobal.env.SYSTEM_PASSWORD;
}
