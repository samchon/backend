import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { IAttachmentFile } from "../../api/structures/common/IAttachmentFile";

import { AttachmentFile } from "../../models/tables/common/AttachmentFile";
import { FilePairBase } from "../../models/tables/common/internal/FilePairBase";

export namespace AttachmentFileProvider
{
    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export function json()
    {
        return builder.get();
    }

    const builder = new Singleton(() => AttachmentFile.createJsonSelectBuilder({}));

    export function replica(file: AttachmentFile): IAttachmentFile.IStore
    {
        return file.toPrimitive("id");
    }

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export function collect(collection: safe.InsertCollection, input: IAttachmentFile.IStore): AttachmentFile;
    export function collect<Pair extends FilePairBase>
        (
            collection: safe.InsertCollection, 
            input: IAttachmentFile.IStore, 
            closure: (file: AttachmentFile) => Pair
        ): AttachmentFile;

    export function collect<Pair extends FilePairBase>
        (
            collection: safe.InsertCollection, 
            input: IAttachmentFile.IStore, 
            closure?: (file: AttachmentFile) => Pair
        ): AttachmentFile
    {
        const file: AttachmentFile = AttachmentFile.initialize({
            id: safe.DEFAULT,
            name: input.name,
            extension: input.extension,
            url: input.url
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