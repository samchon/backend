import { ExceptionManager } from "@nestia/core";
import { Prisma } from "@prisma/client";
import path from "path";

import { MyGlobal } from "./MyGlobal";
import { ErrorProvider } from "./providers/common/ErrorProvider";

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
}

ExceptionManager.insert(Prisma.PrismaClientKnownRequestError, (exp) => {
  switch (exp.code) {
    case "P2025":
      return ErrorProvider.notFound(exp.message);
    case "P2002": // UNIQUE CONSTRAINT
      return ErrorProvider.conflict(exp.message);
    default:
      return ErrorProvider.internal(exp.message);
  }
});
