import { assertType } from "typescript-json";

import api from "@ORGANIZATION/PROJECT-api";
import { ISystem } from "@ORGANIZATION/PROJECT-api/lib/structures/monitors/ISystem";

export async function test_api_monitor_system(
    connection: api.IConnection,
): Promise<void> {
    const system: ISystem = await api.functional.monitors.system.get(
        connection,
    );
    assertType<typeof system>(system);
}
