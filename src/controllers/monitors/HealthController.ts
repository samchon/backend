import nest from "@modules/nestjs";
import helper from "nestia-helper";

@nest.Controller("monitors/health")
export class HealthController {
    @helper.TypedRoute.Get()
    public get(): void {}
}
