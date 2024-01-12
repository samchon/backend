import { IPerformance } from "@ORGANIZATION/PROJECT-api/lib/structures/monitors/IPerformance";
import core from "@nestia/core";
import { Controller } from "@nestjs/common";

@Controller("monitors/performance")
export class MonitorPerformanceController {
  /**
   * Get performance information.
   *
   * Get perofmration information composed with CPU, memory and resource usage.
   *
   * As such information is a type of sensitive, response be encrypted.
   *
   * @returns Performance info
   * @tag Monitor
   *
   * @author Samchon
   */
  @core.EncryptedRoute.Get()
  public async get(): Promise<IPerformance> {
    return {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      resource: process.resourceUsage(),
    };
  }
}
