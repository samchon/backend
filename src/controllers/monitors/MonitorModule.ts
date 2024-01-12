import { EncryptedModule } from "@nestia/core";

import { MyGlobal } from "../../MyGlobal";
import { MonitorHealthController } from "./MonitorHealthController";
import { MonitorPerformanceController } from "./MonitorPerformanceController";
import { MonitorSystemController } from "./MonitorSystemController";

@EncryptedModule(
  {
    controllers: [
      MonitorHealthController,
      MonitorPerformanceController,
      MonitorSystemController,
    ],
  },
  () => ({
    key: MyGlobal.env.API_ENCRYPTION_KEY,
    iv: MyGlobal.env.API_ENCRYPTION_IV,
  }),
)
export class MonitorModule {}
