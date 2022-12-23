import nest from "@modules/nestjs";
import core from "@nestia/core";

@nest.Controller("monitors/health")
export class HealthController {
    @core.TypedRoute.Get()
    public get(): void {}
}
