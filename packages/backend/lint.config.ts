import type { ITtscLintConfig } from "@ttsc/lint";

const config = {
  extends: "../../config/lint.config.ts",
  ignores: ["src/prisma/**/*.ts"],
} satisfies ITtscLintConfig;

export default config;
