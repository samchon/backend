import { Terminal } from "../../utils/Terminal";
import { IUpdateController } from "./IUpdateController";

export class Updator implements IUpdateController {
    public async update(): Promise<void> {
        // REFRESH REPOSITORY
        await Terminal.execute("git pull");
        await Terminal.execute("npm install");
        await Terminal.execute("npm run build");

        // RELOAD PM2
        await Terminal.execute("npm run start:reload");
    }

    public async revert(commit: string): Promise<void> {
        // REVERT REPOSITORY
        await Terminal.execute("git pull");
        await Terminal.execute(`git reset --hard ${commit}`);
        await Terminal.execute("npm install");
        await Terminal.execute("npm run build");

        // RELOAD PM2
        await Terminal.execute("npm run start:reload");
    }
}
