import { MyUpdator } from "../MyUpdator";

async function main(): Promise<void> {
  await MyUpdator.master();
  await MyUpdator.slave("127.0.0.1");
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
