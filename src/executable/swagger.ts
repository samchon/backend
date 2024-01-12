import cp from "child_process";
import express from "express";
import SwaggerUI from "swagger-ui-express";

const execute = (command: string): void => {
  console.log(`\n$ ${command}\n`);
  cp.execSync(command, { stdio: "inherit" });
};

const main = async (): Promise<void> => {
  if (process.argv.includes("--skipBuild") === false) {
    try {
      execute("git pull");
    } catch {}
    execute("npm install");
    execute("npm run build:swagger");
  }
  const docs = await import("../../packages/api/swagger.json" as any);
  const app = express();
  app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(docs));
  app.listen(37810);

  console.log("\n");
  console.log("-----------------------------------------------------------");
  console.log("\n Swagger UI Address: http://127.0.0.1:37810/api-docs \n");
  console.log("-----------------------------------------------------------");
};
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
