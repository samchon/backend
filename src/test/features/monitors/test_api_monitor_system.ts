import { assertType } from "typescript-is";
import api from "../../../api";
import { ISystem } from "../../../api/structures/monitors/ISystem";

export async function test_api_monitor_system(connection: api.IConnection): Promise<void>
{
    const system: ISystem = await api.functional.monitors.system.get(connection);
    assertType<typeof system>(system);
}