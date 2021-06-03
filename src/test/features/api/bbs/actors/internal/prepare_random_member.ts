import { ICitizen } from "../../../../../../api/structures/members/ICitizen";
import { IMember } from "../../../../../../api/structures/members/IMember";
import { Configuration } from "../../../../../../Configuration";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { prepare_random_citizen } from "./prepare_random_citizen";

export function prepare_random_member(citizen?: ICitizen.IStore): IMember.IJoin
{
    return {
        citizen: citizen || prepare_random_citizen(),
        email: `${RandomGenerator.alphabets(16)}@samchon.org`,
        password: Configuration.SYSTEM_PASSWORD
    };
}