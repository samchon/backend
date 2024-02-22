import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { ISystem } from "@ORGANIZATION/PROJECT-api/lib/structures/monitors/ISystem";

import { SystemProvider } from "../../providers/monitors/SystemProvider";
import { DateUtil } from "../../utils/DateUtil";

@Controller("monitors/system")
export class MonitorSystemController {
  /**
   * Get system information.
   *
   * Get system information with commit and package information.
   *
   * @returns System info
   * @tag Monitor
   *
   * @author Samchon
   */
  @core.TypedRoute.Get()
  public async get(): Promise<ISystem> {
    return {
      uid: SystemProvider.uid,
      arguments: process.argv,
      commit: await SystemProvider.commit(),
      package: await SystemProvider.package(),
      created_at: DateUtil.toString(SystemProvider.created_at, true),
    };
  }

  /**
   * @internal
   */
  @core.TypedRoute.Get("internal_server_error")
  public async internal_server_error(): Promise<void> {
    throw new Error("The manual 500 error for the testing.");
  }

  /**
   * @internal
   */
  @core.TypedRoute.Get("uncaught_exception")
  public uncaught_exception(): void {
    new Promise(() => {
      throw new Error("The manul uncaught exception for the testing.");
    }).catch(() => {});
  }
}
