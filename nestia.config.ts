import sdk from "@nestia/sdk";

export const NESTIA_CONFIG: sdk.INestiaConfig = {
    input: "src/controllers",
    output: "src/api",
    swagger: {
        output: "dist/swagger.json",
        servers: [
            {
                url: "http://localhost:37001",
                description: "Local Server",
            },
        ],
    },
};
export default NESTIA_CONFIG;
