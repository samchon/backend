import nest from "@modules/nestjs";

@nest.Controller("monitors/health")
export class HealthController
{
    @nest.Get()
    public get(): void
    {
    }
}