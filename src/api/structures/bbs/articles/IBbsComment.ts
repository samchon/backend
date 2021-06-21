import { IAttachmentFile } from "../../misc/IAttachmentFile";

export interface IBbsComment
{
    id: string;
    writer_type: "CUSTOMER" | "MANAGER";
    writer_name: string;
    body: string;
    files: IAttachmentFile[];
    created_at: string;
}

export namespace IBbsComment
{
    export interface IStore
    {
        body: string;
        files: IAttachmentFile.IStore[];
    }
}