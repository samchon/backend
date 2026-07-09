import { Module } from "@nestjs/common";

import { MonitorHealthController } from "./MonitorHealthController";
import { MonitorPerformanceController } from "./MonitorPerformanceController";
import { MonitorSystemController } from "./MonitorSystemController";

@Module({
  controllers: [
    MonitorHealthController,
    MonitorPerformanceController,
    MonitorSystemController,
  ],
})
export class MonitorModule {}
