import { DynamicExecutor } from "@nestia/e2e";
import chalk from "chalk";
import cp from "child_process";
import fs from "fs";
import { sleep_for } from "tstl";

import { MyConfiguration } from "../src/MyConfiguration";
import MyApi from "../src/api";

const webpackTest = async (): Promise<void> => {
  if (fs.existsSync(MyConfiguration.ROOT + "/dist/server.js") === false)
    throw new Error("Run npm run webpack command first.");

  // START BACKEND SERVER
  const backend = cp.fork(`${MyConfiguration.ROOT}/dist/server.js`, {
    cwd: `${MyConfiguration.ROOT}/dist`,
  });
  console.log(__dirname + "/features");
  await sleep_for(2_500);

  // DO TEST
  const connection: MyApi.IConnection = {
    host: `http://127.0.0.1:${MyConfiguration.API_PORT()}`,
  };
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    prefix: "test",
    location: __dirname + "/features",
    parameters: () => [
      {
        host: connection.host,
        encryption: connection.encryption,
      },
    ],
    onComplete: (exec) => {
      const trace = (str: string) =>
        console.log(`  - ${chalk.green(exec.name)}: ${str}`);
      if (exec.error === null) {
        const elapsed: number =
          new Date(exec.completed_at).getTime() -
          new Date(exec.started_at).getTime();
        trace(`${chalk.yellow(elapsed.toLocaleString())} ms`);
      } else trace(chalk.red(exec.error.name));
    },
  });

  backend.kill();

  // REPORT EXCEPTIONS
  const exceptions: Error[] = report.executions
    .filter((exec) => exec.error !== null)
    .map((exec) => exec.error!);
  if (exceptions.length === 0) {
    console.log("Success");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  } else {
    for (const exp of exceptions) console.log(exp);
    console.log("Failed");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  }
};
webpackTest().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
