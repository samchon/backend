import core from "@nestia/core";
import { Controller } from "@nestjs/common";

@Controller("monitors/health")
export class MonitorHealthController {
  @core.TypedRoute.Get()
  public get(): void {}
}
