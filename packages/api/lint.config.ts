import type { ITtscLintConfig } from "@ttsc/lint";

import shared from "../../config/lint.config";

const config = {
  ...shared,
  ignores: ["src/functional/**/*.ts"],
} satisfies ITtscLintConfig;

export default config;
