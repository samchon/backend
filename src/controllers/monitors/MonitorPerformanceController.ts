import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPerformance } from "@ORGANIZATION/PROJECT-api/lib/structures/monitors/IPerformance";

@Controller("monitors/performance")
export class MonitorPerformanceController {
  @core.TypedRoute.Get()
  public async get(): Promise<IPerformance> {
    return {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      resource: process.resourceUsage(),
    };
  }
}
