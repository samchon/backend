import orm from "@modules/typeorm";
import commander from "commander";
import pg from "pg";

import { Configuration } from "../Configuration";
import { SGlobal } from "../SGlobal";

async function execute(
    host: string,
    database: string,
    username: string,
    password: string,
    script: string,
): Promise<void> {
    const db: orm.Connection = await orm.createConnection({
        type: "postgres",
        host,
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
    const program = new commander.Command();
    program
        .option("--host [host]", "HOST")
        .option("--username <username>", "USERNAME")
        .option("--password <password>", "PASSWORD")
        .parse(process.argv);

    const options = program.opts();
    const host = options.host ?? config.host;
    const username = options.username ?? "postgres";
    const password = options.password ?? "root";

    await execute(
        host,
        "postgres",
        username,
        password,
        `
        CREATE USER "${config.username}" WITH ENCRYPTED PASSWORD '${config.password}';
        CREATE DATABASE "${config.database}" OWNER "${config.username}";
    `,
    );

    await execute(
        host,
        config.database,
        config.username,
        config.password,
        `
        CREATE SCHEMA "${config.schema}" AUTHORIZATION "${config.username}";
    `,
    );

    await execute(
        host,
        config.database,
        username,
        password,
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
