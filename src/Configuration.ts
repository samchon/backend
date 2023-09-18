import nest from "@modules/nestjs";
import { ExceptionManager } from "@nestia/core";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import path from "path";

import { SGlobal } from "./SGlobal";

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
    export const MASTER_IP = () =>
        SGlobal.mode === "LOCAL"
            ? "127.0.0.1"
            : SGlobal.mode === "DEV"
            ? "your-dev-server-ip"
            : "your-real-server-master-ip";
    export const SYSTEM_PASSWORD = () => SGlobal.env.SYSTEM_PASSWORD;
}

ExceptionManager.insert(PrismaClientKnownRequestError, (exp) => {
    switch (exp.code) {
        case "P2025":
            return new nest.NotFoundException(exp.message);
        case "P2002": // UNIQUE CONSTRAINT
            return new nest.ConflictException(exp.message);
        default:
            return new nest.InternalServerErrorException(exp.message);
    }
});
