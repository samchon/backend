import helper from "nestia-helper";
import * as nest from "@nestjs/common";

import { IPerformance } from "../../api/structures/monitors/IPerformance";

@nest.Controller("monitors/performance")
export class PerformanceController
{
    @helper.EncryptedRoute.Get()
    public async get(): Promise<IPerformance>
    {
        return {
            cpu: process.cpuUsage(),
            memory: process.memoryUsage(),
            resource: process.resourceUsage()
        };
    }
}