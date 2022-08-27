import { start_updator_master } from "./internal/start_updator_master";
import { start_updator_slave } from "./internal/start_updator_slave";

async function main(): Promise<void> {
    await start_updator_master();
    await start_updator_slave("127.0.0.1");
}
main().catch(() => {});
