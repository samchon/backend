import safe from "safe-typeorm";

import { IAttachmentFile } from "../../api/structures/misc/IAttachmentFile";

import { AttachmentFile } from "../../models/tables/misc/AttachmentFile";
import { FilePairBase } from "../../models/tables/misc/internal/FilePairBase";

export namespace AttachmentFileProvider
{
    export function collect<Pair extends FilePairBase>
        (
            collection: safe.InsertCollection,
            input: IAttachmentFile.IStore,
            closure: (file: AttachmentFile) => Pair
        ): AttachmentFile
    {
        const file: AttachmentFile = AttachmentFile.initialize({
            ...input,
            id: safe.DEFAULT,
            created_at: safe.DEFAULT
        });
        collection.push(file);

        if (closure)
        {
            const pair: Pair = closure(file);
            collection.push(pair);
        }
        return file;
    }
}