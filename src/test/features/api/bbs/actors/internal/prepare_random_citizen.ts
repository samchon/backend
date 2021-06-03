import { ICitizen } from "../../../../../../api/structures/members/ICitizen";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";

export function prepare_random_citizen(): ICitizen
{
    return {
        mobile: RandomGenerator.mobile(),
        name: RandomGenerator.name()
    }
}