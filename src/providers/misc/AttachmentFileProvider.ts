import safe from "safe-typeorm";
import { Singleton } from "tstl/thread/Singleton";

import { IAttachmentFile } from "../../api/structures/misc/IAttachmentFile";

import { AttachmentFile } from "../../models/tables/misc/AttachmentFile";
import { FilePairBase } from "../../models/tables/misc/internal/FilePairBase";

export namespace AttachmentFileProvider
{
    export function json()
    {
        return json_builder.get();
    }

    const json_builder = new Singleton(() => safe.createJsonSelectBuilder
    (
        AttachmentFile,
        {}
    ));

    export function collectList<Pair extends FilePairBase>
        (
            collection: safe.InsertCollection,
            inputList: IAttachmentFile.IStore[],
            closure: (file: AttachmentFile, sequence: number) => Pair
        ): AttachmentFile[]
    {
        if (inputList.length === 0)
            return [];

        const fileList: AttachmentFile[] = inputList.map(input => 
            AttachmentFile.initialize({
                ...input,
                id: safe.DEFAULT,
                created_at: safe.DEFAULT
            }));
        collection.push(fileList);

        if (closure)
        {
            const pairList: Pair[] = fileList.map
            (
                (file, sequence) => closure(file, sequence)
            );
            collection.push(pairList);
        }
        return fileList;
    }
}