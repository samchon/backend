const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js")
    require("source-map-support").install();
    
import safe from "safe-typeorm";
import { IPassword } from "encrypted-nestjs";

import { SGlobal } from "./SGlobal";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";

export class Configuration
{
    public static get MASTER_IP(): string
    {
        if (SGlobal.mode === "LOCAL")
            return "127.0.0.1";
        else if (SGlobal.mode === "DEV")
            return "YOUR-DEV-SERVER-HOST";
        else
            return "YOUR-REAL-SERVER-HOST";
    }

    public static get DB_CONFIG(): MysqlConnectionOptions
    {
        const account: string = (SGlobal.mode === "LOCAL") ? "root" : "bbs_w";
        const host: string = (SGlobal.mode === "REAL")
            ? "YOUR-RDS-ADDRESS"
            : "127.0.0.1";

        return {
            // CONNECTION INFO
            type: "mariadb" as const,
            host: host,
            port: 3306,
            username: account,
            password: (SGlobal.mode === "LOCAL") ? "root" : Configuration.SYSTEM_PASSWORD,
            database: (SGlobal.mode === "LOCAL") ? "bbs_test" : "bbs",

            // OPTIONS
            namingStrategy: new safe.NamingStrategy(),
            bigNumberStrings: false,
            dateStrings: false,
            entities: [ `${__dirname}/models/**/*.${EXTENSION}` ]
        };
    }
}

export namespace Configuration
{
    export const API_PORT = 37861;
    export const UPDATOR_PORT = 37860;
    
    export const ENCRYPTION_PASSWORD: Readonly<IPassword> = {
        key: "pJXhbHlYfzkC1CBK8R67faaBgJWB9Myu",
        iv: "IXJBt4MflFxvxKkn"
    };

    export const SYSTEM_PASSWORD: string = "https://github.com/samchon";
    export const CREATED_AT: Date = new Date();
}