import { DynamicExecutor, StopWatch } from "@nestia/e2e";
import fs from "fs";
import { Singleton, randint } from "tstl";
import { sleep_for } from "tstl/thread/global";

import { MyBackend } from "../src/MyBackend";
import { MyConfiguration } from "../src/MyConfiguration";
import { MyGlobal } from "../src/MyGlobal";
import { MyUpdator } from "../src/MyUpdator";
import api from "../src/api";
import { MySetupWizard } from "../src/setup/MySetupWizard";
import { ArgumentParser } from "../src/utils/ArgumentParser";
import { ErrorUtil } from "../src/utils/ErrorUtil";

interface IOptions {
  reset: boolean;
  include?: string[];
  exclude?: string[];
  trace: boolean;
}

const getOptions = () =>
  ArgumentParser.parse<IOptions>(async (command, prompt, action) => {
    command.option("--reset <true|false>", "reset local DB or not");
    command.option("--include <string...>", "include feature files");
    command.option("--exclude <string...>", "exclude feature files");
    command.option("--trace <boolean>", "trace detailed errors");

    return action(async (options) => {
      if (typeof options.reset === "string")
        options.reset = options.reset === "true";
      options.reset ??= await prompt.boolean("reset")("Reset local DB");
      options.trace = options.trace !== ("false" as any);
      return options as IOptions;
    });
  });

function cipher(val: number): string {
  if (val < 10) return "0" + val;
  else return String(val);
}

async function handle_error(exp: any): Promise<void> {
  try {
    const date: Date = new Date();
    const fileName: string = `${date.getFullYear()}${cipher(
      date.getMonth() + 1,
    )}${cipher(date.getDate())}${cipher(date.getHours())}${cipher(
      date.getMinutes(),
    )}${cipher(date.getSeconds())}.${randint(0, Number.MAX_SAFE_INTEGER)}`;
    const content: string = JSON.stringify(ErrorUtil.toJSON(exp), null, 4);

    await directory.get();
    await fs.promises.writeFile(
      `${__dirname}/../../assets/logs/errors/${fileName}.log`,
      content,
      "utf8",
    );
  } catch {}
}

async function main(): Promise<void> {
  // UNEXPECTED ERRORS
  global.process.on("uncaughtException", handle_error);
  global.process.on("unhandledRejection", handle_error);

  // CONFIGURE
  const options: IOptions = await getOptions();
  MyGlobal.testing = true;

  if (options.reset) {
    await StopWatch.trace("Reset DB")(MySetupWizard.schema);
    await StopWatch.trace("Seed Data")(MySetupWizard.seed);
  }

  // OPEN SERVER
  const updator = await MyUpdator.master();
  const backend: MyBackend = new MyBackend();
  await backend.open();

  // DO TEST
  const connection: api.IConnection = {
    host: `http://127.0.0.1:${MyConfiguration.API_PORT()}`,
  };
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    prefix: "test",
    parameters: () => [
      {
        host: connection.host,
        encryption: connection.encryption,
      },
    ],
    filter: (func) =>
      (!options.include?.length ||
        (options.include ?? []).some((str) => func.includes(str))) &&
      (!options.exclude?.length ||
        (options.exclude ?? []).every((str) => !func.includes(str))),
  })(__dirname + "/features");

  // TERMINATE
  await sleep_for(2500); // WAIT FOR BACKGROUND EVENTS
  await backend.close();
  await updator.close();

  const exceptions: Error[] = report.executions
    .filter((exec) => exec.error !== null)
    .map((exec) => exec.error!);
  if (exceptions.length === 0) {
    console.log("Success");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  } else {
    if (options.trace !== false) for (const exp of exceptions) console.log(exp);
    console.log("Failed");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
    process.exit(-1);
  }
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});

const directory = new Singleton(async () => {
  await mkdir(`${__dirname}/../../assets`);
  await mkdir(`${__dirname}/../../assets/logs`);
  await mkdir(`${__dirname}/../../assets/logs/errors`);
});

async function mkdir(path: string): Promise<void> {
  try {
    await fs.promises.mkdir(path);
  } catch {}
}
