import { IBbsSectionManager } from "../actors/IBbsSectionManager";

export interface IBbsSection
{
    id: string;
    code: string;
    type: IBbsSection.Type;
    name: string;
    created_at: string;

    managers: IBbsSectionManager[];
}

export namespace IBbsSection
{
    export type Type = "FREE" | "QNA" | "REVIEW" | "NOTICE";

    export interface IStore
    {
        type: Type;
        code: string;
        name: string;
    }
}