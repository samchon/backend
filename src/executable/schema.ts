import orm from "@modules/typeorm";
import pg from "pg";

import { Configuration } from "../Configuration";
import { SGlobal } from "../SGlobal";

async function execute(
    database: string,
    username: string,
    password: string,
    script: string,
): Promise<void> {
    const db: orm.Connection = await orm.createConnection({
        type: "postgres",
        host: "127.0.0.1",
        database,
        username,
        password,
    });
    const queries: string[] = script
        .split("\n")
        .map((str) => str.trim())
        .filter((str) => !!str);
    for (const query of queries) await db.query(query);
    await db.close();
}

async function main(): Promise<void> {
    pg.defaults.poolSize = 1;
    SGlobal.setMode("LOCAL");

    const config = await Configuration.DB_CONFIG();

    await execute(
        "postgres",
        process.argv[2] || "postgres",
        process.argv[3] || "root",
        `
        CREATE USER "${config.username}" WITH ENCRYPTED PASSWORD '${config.password}';
        CREATE DATABASE "${config.database}" OWNER "${config.username}";
    `,
    );

    await execute(
        config.database,
        config.username,
        config.password,
        `
        CREATE SCHEMA "${config.schema}" AUTHORIZATION "${config.username}";
    `,
    );

    await execute(
        config.database,
        "postgres",
        "root",
        `
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "${config.schema}" TO "${config.username}";

        CREATE USER "${config.readonlyUsername}" WITH ENCRYPTED PASSWORD '${config.password}';
        GRANT CONNECT ON DATABASE "${config.database}" TO "${config.readonlyUsername}";
        GRANT USAGE ON SCHEMA "${config.schema}" TO "${config.readonlyUsername}";
        GRANT SELECT ON ALL TABLES IN SCHEMA "${config.schema}" TO "${config.readonlyUsername}";
    `,
    );
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
