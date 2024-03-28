import fs from "fs";
import git from "git-last-commit";
import { Singleton, randint } from "tstl";

import { ISystem } from "@ORGANIZATION/PROJECT-api/lib/structures/monitors/ISystem";

import { MyConfiguration } from "../../MyConfiguration";
import { DateUtil } from "../../utils/DateUtil";

export class SystemProvider {
  public static readonly uid: number = randint(0, Number.MAX_SAFE_INTEGER);
  public static readonly created_at: Date = new Date();

  public static package(): Promise<ISystem.IPackage> {
    return package_.get();
  }

  public static commit(): Promise<ISystem.ICommit> {
    return commit_.get();
  }
}

const commit_: Singleton<Promise<ISystem.ICommit>> = new Singleton(
  () =>
    new Promise((resolve, reject) => {
      git.getLastCommit((err, commit) => {
        if (err) reject(err);
        else
          resolve({
            ...commit,
            authored_at: DateUtil.toString(
              new Date(Number(commit.authoredOn) * 1000),
              true,
            ),
            commited_at: DateUtil.toString(
              new Date(Number(commit.committedOn) * 1000),
              true,
            ),
          });
      });
    }),
);
const package_: Singleton<Promise<ISystem.IPackage>> = new Singleton(
  async () => {
    const content: string = await fs.promises.readFile(
      `${MyConfiguration.ROOT}/package.json`,
      "utf8",
    );
    return JSON.parse(content);
  },
);

commit_.get().catch(() => {});
package_.get().catch(() => {});
