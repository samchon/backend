import { MyUpdator } from "../MyUpdator";

async function main(): Promise<void> {
  await MyUpdator.slave();
}
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
