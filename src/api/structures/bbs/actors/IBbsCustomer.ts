import { ICitizen } from "../../members/ICitizen";
import { IMember } from "../../members/IMember";

export type IBbsCustomer<Ensure extends boolean = boolean> 
    = Ensure extends true ? IBbsCustomer.IActivated
    : Ensure extends false ? IBbsCustomer.IGuest
    : IBbsCustomer.IUnknown;

export namespace IBbsCustomer
{
    export interface IUnknown
    {
        id: string;
        ip: string;
        citizen: ICitizen | null;
        member: IMember | null;
        href: string;
        referrer: string;
        created_at: string;
    }

    export interface IGuest extends Omit<IUnknown, "citizen"|"member">
    {
        citizen: null;
        member: null;
    }
    export interface IActivated extends Omit<IUnknown, "citizen">
    {
        citizen: ICitizen;
    }

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