import { INestiaConfig } from "@nestia/sdk";

export const NESTIA_CONFIG: INestiaConfig = {
    simulate: true,
    input: "src/controllers",
    output: "src/api",
    swagger: {
        output: "packages/api/swagger.json",
        servers: [
            {
                url: "http://localhost:37001",
                description: "Local Server",
            },
        ],
    },
};
export default NESTIA_CONFIG;
