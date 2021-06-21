import { IMember } from "../../members/IMember";
import { IBbsSection } from "../systematic/IBbsSection";

export interface IBbsManager 
    extends IBbsManager.IReference
{
    sections: IBbsManager.INominatedSection[];
}

export namespace IBbsManager
{
    export type IReference = IMember;
    export interface INominatedSection extends IBbsSection.IReference
    {
        nominated_at: string;
    }

    export namespace IAuthorization
    {
        export import IJoin = IMember.IJoin;
        export import ILogin = IMember.ILogin;
        export import IChangePassword = IMember.IChangePassword;
        export import IResetPassword = IMember.IResetPassword;
    }
}