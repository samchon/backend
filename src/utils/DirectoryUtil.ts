import fs from "fs";

export namespace DirectoryUtil {
    export function mkdir(path: string): Promise<void> {
        return new Promise((resolve) => {
            fs.promises
                .mkdir(path)
                .then(resolve)
                .catch(() => resolve());
        });
    }
}
