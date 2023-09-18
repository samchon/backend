import cp from "child_process";

import { SGlobal } from "../SGlobal";

export namespace SetupWizard {
    export async function schema(): Promise<void> {
        if (SGlobal.testing === false)
            throw new Error(
                "Erron on SetupWizard.schema(): unable to reset database in non-test mode.",
            );
        const execute = (type: string) => (argv: string) =>
            cp.execSync(
                `npx prisma migrate ${type} --schema=src/schema.prisma ${argv}`,
                { stdio: "ignore" },
            );
        execute("reset")("--force");
        execute("dev")("--name init");
    }

    export async function seed(): Promise<void> {}
}
