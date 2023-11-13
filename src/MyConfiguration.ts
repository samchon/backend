import { ExceptionManager } from "@nestia/core";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import path from "path";

import { ErrorProvider } from "./providers/common/ErrorProvider";

import { MyGlobal } from "./MyGlobal";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

export namespace MyConfiguration {
  export const ROOT = (() => {
    const splitted: string[] = __dirname.split(path.sep);
    return splitted.at(-1) === "src" && splitted.at(-2) === "bin"
      ? path.resolve(__dirname + "/../..")
      : path.resolve(__dirname + "/..");
  })();

  export const API_PORT = () => Number(MyGlobal.env.API_PORT);
  export const UPDATOR_PORT = () => Number(MyGlobal.env.UPDATOR_PORT);
  export const MASTER_IP = () =>
    MyGlobal.mode === "local"
      ? "127.0.0.1"
      : MyGlobal.mode === "dev"
      ? "your-dev-server-ip"
      : "your-real-server-master-ip";
  export const SYSTEM_PASSWORD = () => MyGlobal.env.SYSTEM_PASSWORD;
}

ExceptionManager.insert(PrismaClientKnownRequestError, (exp) => {
  switch (exp.code) {
    case "P2025":
      return ErrorProvider.notFound(exp.message);
    case "P2002": // UNIQUE CONSTRAINT
      return ErrorProvider.conflict(exp.message);
    default:
      return ErrorProvider.internal(exp.message);
  }
});
