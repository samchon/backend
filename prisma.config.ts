import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",
  datasource: {
    url: env("POSTGRES_URL"),
  },
});
