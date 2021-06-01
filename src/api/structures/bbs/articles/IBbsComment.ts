export interface IBbsComment
{
    id: string;
    writer_name: string;
    writer_type: "CUSTOMER" | "MANAGER";
    type: string;
    body: string;
    created_at: string;
}

export namespace IBbsComment
{
    export interface IStore
    {
        body: string;
    }
}