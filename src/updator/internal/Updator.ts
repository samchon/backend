import { IUpdateController } from "./IUpdateController";
import { Terminal } from "../../utils/Terminal";

export class Updator implements IUpdateController
{
    public async update(): Promise<void>
    {
        // REFRESH REPOSITORY
        await Terminal.execute("git pull");
        await Terminal.execute("npm install");
        await Terminal.execute("npm run build");

        // RELOAD PM2
        await Terminal.execute("npm run start:reload");
    }
}