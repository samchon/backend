import { IBbsManager } from "../actors/IBbsManager";

export interface IBbsSection extends IBbsSection.IReference
{
    managers: IBbsSection.INominatedManager[];
}

export namespace IBbsSection
{
    export type Type = "FREE" | "QNA" | "REVIEW" | "NOTICE";
    export interface IReference
    {
        code: string;
        type: IBbsSection.Type;
        name: string;
        created_at: string;
    }
    export interface INominatedManager extends IBbsManager.IReference
    {
        nominated_at: string;
    }

    export interface IStore
    {
        type: Type;
        code: string;
        name: string;
    }
    export interface IUpdate
    {
        name: string;
    }

    export interface IUnify
    {
        keep_code: string;
        absorbed_codes: string[];
    }
}