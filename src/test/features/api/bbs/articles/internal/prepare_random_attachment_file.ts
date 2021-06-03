import { randint } from "tstl/algorithm/random";
import { IAttachmentFile } from "../../../../../../api/structures/misc/IAttachmentFile";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";

export function prepare_random_attachment_file(): IAttachmentFile.IStore
{
    const directory: string = RandomGenerator.alphabets(20);
    const name: string = RandomGenerator.alphabets(randint(5, 16));
    const extension: string = RandomGenerator.alphabets(3);
    const url: string = `http://127.0.0.1/files/${directory}/${name}.${extension}`;

    return {
        name,
        extension,
        url
    };
}
