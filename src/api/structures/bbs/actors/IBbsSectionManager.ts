import { IMember } from "../../members/IMember";

export interface IBbsSectionManager
{
    id: string;
    member: IMember;
    created_at: string;
    resigned_at: string | null;
}