const fs = require("fs");
const os = require("os");
const path = require("path");
const terser = require("@rollup/plugin-terser");
const { TtscCompiler } = require("ttsc");

const PROJECT_DIR = __dirname;
const VIRTUAL_PREFIX = "\0ttsc:";

const normalize = (file) => file.replace(/\\/g, "/");

const compileProject = () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "project-api-rollup-"));
  const config = path.join(directory, "tsconfig.json");

  fs.writeFileSync(
    config,
    JSON.stringify(
      {
        extends: normalize(path.join(PROJECT_DIR, "tsconfig.json")),
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          module: "ESNext",
          target: "ESNext",
        },
      },
      null,
      2,
    ),
  );

  try {
    const result = new TtscCompiler({
      cwd: PROJECT_DIR,
      projectRoot: PROJECT_DIR,
      tsconfig: config,
    }).compile();

    if (result.type === "exception") {
      throw new Error(
        result.error instanceof Error ? result.error.message : String(result.error),
      );
    }
    if (result.type === "failure") {
      throw new Error(
        result.diagnostics
          .map((d) =>
            [d.file, d.line, d.character, d.messageText]
              .filter((v) => v !== null && v !== undefined && v !== "")
              .join(":"),
          )
          .join("\n"),
      );
    }
    return result.output;
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
};

const ttscMemory = () => {
  let output = {};

  const resolve = (source, importer) => {
    if (source === "lib/index.js") {
      return "lib/index.js";
    }
    if (importer === undefined || source.startsWith(".") === false) {
      return null;
    }

    const base = path.posix.normalize(
      path.posix.join(path.posix.dirname(importer), normalize(source)),
    );
    const candidates = [
      base.endsWith(".js") ? base : `${base}.js`,
      path.posix.join(base, "index.js"),
    ];
    return candidates.find((key) => output[key] !== undefined) ?? null;
  };

  return {
    name: "ttsc-memory",
    buildStart: () => {
      output = compileProject();
    },
    resolveId: (source, importer) => {
      const key = resolve(
        source,
        importer?.startsWith(VIRTUAL_PREFIX)
          ? importer.slice(VIRTUAL_PREFIX.length)
          : importer,
      );
      return key === null ? null : `${VIRTUAL_PREFIX}${key}`;
    },
    load: (id) => {
      if (id.startsWith(VIRTUAL_PREFIX) === false) {
        return null;
      }

      const key = id.slice(VIRTUAL_PREFIX.length);
      const code = output[key];
      if (code === undefined) {
        return null;
      }

      const map = output[`${key}.map`];
      return {
        code: code.replace(/\n?\/\/# sourceMappingURL=.*$/u, ""),
        map: map === undefined ? null : JSON.parse(map),
      };
    },
  };
};

module.exports = {
  external: (id) =>
    id.startsWith(VIRTUAL_PREFIX) === false &&
    id.startsWith(".") === false &&
    id.startsWith("/") === false &&
    /^[\w@]/u.test(id),
  output: {
    dir: `${PROJECT_DIR}/lib`,
    entryFileNames: "[name].mjs",
    format: "esm",
    sourcemap: true,
  },
  input: {
    index: "lib/index.js",
  },
  plugins: [
    ttscMemory(),
    terser({
      format: {
        comments: "some",
        beautify: true,
        ecma: "2020",
      },
      compress: false,
      mangle: false,
      module: true,
    }),
  ],
};
