import { DynamicModule } from "@nestia/core";

export const MyModule = () => DynamicModule.mount(__dirname + "/controllers");
