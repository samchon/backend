import cp from "child_process";

import { MyGlobal } from "../MyGlobal";

export namespace MySetupWizard {
  export async function schema(): Promise<void> {
    if (MyGlobal.testing === false)
      throw new Error(
        "Erron on SetupWizard.schema(): unable to reset database in non-test mode.",
      );
    const execute = (type: string) => (argv: string) =>
      cp.execSync(
        `npx prisma migrate ${type} --schema=prisma/schema.prisma ${argv}`,
        { stdio: "ignore" },
      );
    execute("reset")("--force");
    execute("dev")("--name init");

    await MyGlobal.prisma.$executeRawUnsafe(
      `GRANT SELECT ON ALL TABLES IN SCHEMA ${MyGlobal.env.POSTGRES_SCHEMA} TO ${MyGlobal.env.POSTGRES_USERNAME_READONLY}`,
    );
  }

  export async function seed(): Promise<void> {}
}
