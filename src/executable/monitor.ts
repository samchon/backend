import { MyConfiguration } from "../MyConfiguration";
import { MyGlobal } from "../MyGlobal";
import api from "../api";
import { IPerformance } from "../api/structures/monitors/IPerformance";
import { ISystem } from "../api/structures/monitors/ISystem";

async function main(): Promise<void> {
  // CONFIGURE MODE
  if (process.argv[2])
    MyGlobal.setMode(process.argv[2] as typeof MyGlobal.mode);

  // GET PERFORMANCE & SYSTEM INFO
  const connection: api.IConnection = {
    host: `http://${MyConfiguration.MASTER_IP()}:${MyConfiguration.API_PORT()}`,
  };
  const performance: IPerformance =
    await api.functional.monitors.performance.get(connection);
  const system: ISystem = await api.functional.monitors.system.get(connection);

  // TRACE THEM
  console.log({ performance, system });
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
