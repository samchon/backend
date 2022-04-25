import nestia from "nestia";

export const NESTIA_CONFIG: nestia.IConfiguration = {
    input: "src/controllers",
    output: "src/api",
    json: true
};
export default NESTIA_CONFIG;