import { v4 } from "uuid";

import { IAttachmentFile } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IAttachmentFile";

import { Prisma } from ".prisma/client";

export namespace AttachmentFileProvider {
    export namespace json {
        export const select = () => ({});
        export const transform = (
            input: Prisma.attachment_filesGetPayload<ReturnType<typeof select>>,
        ): IAttachmentFile => ({
            id: input.id,
            name: input.name,
            extension: input.extension,
            url: input.url,
            created_at: input.created_at.toISOString(),
        });
    }

    export function collect(
        input: IAttachmentFile.IStore,
    ): Prisma.attachment_filesCreateInput {
        return {
            id: v4(),
            name: input.name,
            extension: input.extension,
            url: input.url,
            created_at: new Date(),
        };
    }
}
