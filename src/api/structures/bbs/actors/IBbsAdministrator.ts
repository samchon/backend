import { IMember } from "../../members/IMember";

export type IBbsAdministrator = IMember;
export namespace IBbsAdministrator
{
    export namespace IAuthorization
    {
        export import ILogin = IMember.ILogin;
        export import IChangePassword = IMember.IChangePassword;
        export import IResetPassword = IMember.IResetPassword;
    }
}