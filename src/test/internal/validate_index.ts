import { equal } from "tstl/ranges/algorithm/iterations";

interface IEntity
{
    id: string;
}

function get_ids<Entity extends IEntity>(entities: Entity[]): string[]
{
    return entities.map(entity => entity.id).sort((x, y) => x < y ? -1 : 1);
}

export function validate_index<Solution extends IEntity, Summary extends IEntity>
    (symbol: string, solution: Solution[], summaries: Summary[]): void
{
    const length: number = Math.min(solution.length, summaries.length);
    const xIds: string[] = get_ids(solution).slice(0, length);
    const yIds: string[] = get_ids(summaries).filter(id => id >= xIds[0]).slice(0, length);
    

    if (equal(xIds, yIds) === true)
        return;

    console.log(xIds);
    console.log(yIds);
    
    throw new Error(`Bug on ${symbol}: result of the index is different with manual aggregation.`);
}