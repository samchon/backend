const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const files = {
  "src/index.ts": `import * as api from "./module";

export type * from "./IConnection";
export type * from "./Primitive";
export type * from "./Resolved";
export * from "./HttpError";

export * from "./structures";

export * as functional from "./functional/index";

export default api;
`,
  "src/module.ts": `export type * from "./IConnection";
export type * from "./Primitive";
export type * from "./Resolved";
export * from "./HttpError";

export * from "./structures";

export * as functional from "./functional/index";
`,
};

for (const [relative, content] of Object.entries(files)) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) continue;
  fs.writeFileSync(file, content, "utf8");
}

const functional = path.join(root, "src", "functional", "index.ts");
if (!fs.existsSync(functional)) {
  fs.mkdirSync(path.dirname(functional), { recursive: true });
  fs.writeFileSync(functional, "export {};\n", "utf8");
}
