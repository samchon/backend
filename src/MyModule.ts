import { EncryptedModule } from "@nestia/core";

import { MyGlobal } from "./MyGlobal";
import { MonitorModule } from "./controllers/monitors/MonitorModule";

@EncryptedModule(
  {
    imports: [MonitorModule],
  },
  () => ({
    key: MyGlobal.env.API_ENCRYPTION_KEY,
    iv: MyGlobal.env.API_ENCRYPTION_IV,
  }),
)
export class MyModule {}
