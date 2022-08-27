import fs from "fs";
import { randint } from "tstl/algorithm/random";
import { Singleton } from "tstl/thread/Singleton";

import { Configuration } from "../Configuration";
import { DirectoryUtil } from "./DirectoryUtil";

import serializeError = require("serialize-error");

export namespace ErrorUtil {
    export function toJSON(err: any): object {
        return err instanceof Object && err.toJSON instanceof Function
            ? err.toJSON()
            : serializeError(err);
    }

    export async function log(
        prefix: string,
        data: string | object | Error,
    ): Promise<void> {
        try {
            if (data instanceof Error) data = toJSON(data);

            const date: Date = new Date();
            const fileName: string = `${date.getFullYear()}${cipher(
                date.getMonth() + 1,
            )}${cipher(date.getDate())}${cipher(date.getHours())}${cipher(
                date.getMinutes(),
            )}${cipher(date.getSeconds())}.${randint(
                0,
                Number.MAX_SAFE_INTEGER,
            )}`;
            const content: string = JSON.stringify(data, null, 4);

            await directory.get();
            await fs.promises.writeFile(
                `${Configuration.ASSETS}/logs/errors/${prefix}_${fileName}.log`,
                content,
                "utf8",
            );
        } catch {}
    }
}

function cipher(val: number): string {
    if (val < 10) return "0" + val;
    else return String(val);
}

const directory = new Singleton(async () => {
    await DirectoryUtil.mkdir(`${Configuration.ASSETS}/logs`);
    await DirectoryUtil.mkdir(`${Configuration.ASSETS}/logs/errors`);
});
