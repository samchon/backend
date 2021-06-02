import { ICitizen } from "../../members/ICitizen";
import { IMember } from "../../members/IMember";

export interface IBbsCustomer<Ensure extends boolean = false>
{
    id: string;
    citizen: Ensure extends true
        ? ICitizen
        : (ICitizen | null);
    member: IMember | null;
    ip: string;
    href: string;
    referrer: string;
    created_at: string;
}

export namespace IBbsCustomer
{
    export interface IStore
    {
        href: string;
        referrer: string;
    }

    export namespace IAuthorization
    {
        export import IJoin = IMember.IJoin;
        export import ILogin = IMember.ILogin;
        export import IChangePassword = IMember.IChangePassword;
        export import IResetPassword = IMember.IResetPassword;
    }
}