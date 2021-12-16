import fs from "fs";
import helper from "nestia-helper";
import git from "git-last-commit";
import * as nest from "@nestjs/common";
import { Singleton } from "tstl/thread/Singleton";
import { sleep_for } from "tstl/thread/global";
import { randint } from "tstl/algorithm/random";

import { Configuration } from "../../Configuration";
import { DateUtil } from "../../utils/DateUtil";

import { ISystem } from "../../api/structures/monitors/ISystem";

@nest.Controller("monitors/system")
export class SystemController
{
    @helper.EncryptedRoute.Get()
    public async get(): Promise<ISystem>
    {
        return {
            uid: uid_,
            arguments: process.argv,
            created_at: DateUtil.to_string(Configuration.CREATED_AT, true),
            package: await package_.get(),
            commit: await commit_.get()
        };
    }
    
    @helper.EncryptedRoute.Get(":ms")
    public async sleep
        (
            @helper.TypedParam("ms", "number") ms: number
        ): Promise<ISystem>
    {
        await sleep_for(ms);
        return await this.get();
    }
}

const uid_: number = randint(0, Number.MAX_SAFE_INTEGER);
const commit_: Singleton<Promise<ISystem.ICommit>> = new Singleton
(
    () => new Promise((resolve, reject) =>
    {
        git.getLastCommit((err, commit) =>
        {
            if (err)
                reject(err);
            else
                resolve({
                    ...commit,
                    authored_at: DateUtil.to_string(new Date(Number(commit.authoredOn) * 1000), true),
                    commited_at: DateUtil.to_string(new Date(Number(commit.committedOn) * 1000), true),
                });
        });
    })
);
const package_: Singleton<Promise<ISystem.IPackage>> = new Singleton(async () =>
{
    const content: string = await fs.promises.readFile(`${__dirname}/../../../package.json`, "utf8");
    return JSON.parse(content);
});

commit_.get().catch(() => {});
package_.get().catch(() => {});