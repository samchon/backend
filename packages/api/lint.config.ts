import type { ITtscLintConfig } from "@ttsc/lint";

const config = {
  extends: "../../config/lint.config.ts",
  ignores: ["src/functional/**/*.ts"],
} satisfies ITtscLintConfig;

export default config;
