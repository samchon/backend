import { Module } from "@nestjs/common";

import { MonitorModule } from "./controllers/monitors/MonitorModule";

@Module({
  imports: [MonitorModule],
})
export class MyModule {}
