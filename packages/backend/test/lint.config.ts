import type { ITtscLintConfig } from "@ttsc/lint";

import shared from "../../../config/lint.config";

const config = {
  ...shared,
} satisfies ITtscLintConfig;

export default config;
