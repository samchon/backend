import { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";

import { MyModule } from "./src/MyModule";

export const NESTIA_CONFIG: INestiaConfig = {
  input: () => NestFactory.create(MyModule),
  output: "src/api",
  swagger: {
    output: "packages/api/swagger.json",
    servers: [
      {
        url: "http://localhost:37001",
        description: "Local Server",
      },
    ],
    beautify: true,
  },
  keyword: true,
  simulate: true,
  primitive: false,
};
export default NESTIA_CONFIG;
