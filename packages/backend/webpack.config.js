const path = require("path");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const { IgnorePlugin } = require("webpack");

const lazyImports = [
  "@modelcontextprotocol/sdk",
  "@fastify/static",
  "@fastify/view",
  "@nestjs/microservices",
  "@nestjs/websockets",
  "class-transformer",
  "class-validator",
];

// @reference https://tech-blog.s-yoshiki.com/entry/297
module.exports = {
  // CUSTOMIZE HERE
  entry: {
    server: "./lib/executable/server.js",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
  },
  optimization: {
    minimize: true,
  },

  // JUST KEEP THEM
  mode: "production",
  target: "node",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: ".env",
          to: "[name][ext]",
        },
        {
          from: "package.json",
          to: "[name][ext]",
        },
      ],
    }),
    new WriteFilePlugin(),
    new IgnorePlugin({
      checkResource: (resource) => {
        if (lazyImports.some((modulo) => resource.startsWith(modulo))) {
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
        }
        return false;
      },
    }),
  ],
};
