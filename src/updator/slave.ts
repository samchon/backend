import { MyConfiguration } from "../MyConfiguration";
import { MyGlobal } from "../MyGlobal";
import { start_updator_slave } from "./internal/start_updator_slave";

async function main(): Promise<void> {
    // CONFIGURE MODE
    if (process.argv[2])
        MyGlobal.setMode(process.argv[2] as typeof MyGlobal.mode);

    // START THE CLIENT
    await start_updator_slave(MyConfiguration.MASTER_IP());
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
