export type IAttachmentFile = IAttachmentFile.IStore;

export namespace IAttachmentFile
{
    export interface IStore
    {
        name: string;
        extension: string | null;
        url: string;
    }
}