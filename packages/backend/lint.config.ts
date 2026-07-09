import type { ITtscLintConfig } from "@ttsc/lint";

import shared from "../../config/lint.config";

const config = {
  ...shared,
  ignores: ["src/prisma/**/*.ts"],
} satisfies ITtscLintConfig;

export default config;
