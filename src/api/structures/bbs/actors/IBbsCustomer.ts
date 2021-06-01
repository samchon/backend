import { ICitizen } from "../../members/ICitizen";
import { IMember } from "../../members/IMember";

export interface IBbsConsumer
{
    id: string;
    citizen: ICitizen | null;
    member: IMember | null;
    ip: string;
    href: string;
    referrer: string;
    created_at: string;
}

export namespace IBbsConsumer
{
    export interface IStore
    {
        href: string;
        referrer: string;
    }
}