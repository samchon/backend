import { MyBackend } from "../MyBackend";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support/register");

async function main(): Promise<void> {
  // BACKEND SEVER LATER
  const backend: MyBackend = new MyBackend();
  await backend.open();

  // POST-PROCESS
  process.send?.("ready");
  process.on("SIGTERM", async () => {
    await backend.close();
    process.exit(0);
  });
  global.process.on("uncaughtException", console.error);
  global.process.on("unhandledRejection", console.error);
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
