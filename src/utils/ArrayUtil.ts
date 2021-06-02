import { sample as _Sample } from "tstl/ranges/algorithm/random";

export namespace ArrayUtil
{
    export async function asyncFilter<Input>
        (
            elements: Input[],
            pred: (elem: Input, index: number, array: Input[]) => Promise<boolean>
        ): Promise<Input[]>
    {
        const ret: Input[] = [];
        for (let i: number = 0; i < elements.length; ++i)
            if (await pred(elements[i], i, elements) === true)
                ret.push(elements[i]);
        return ret;
    }

    export async function asyncMap<Input, Output>
        (
            elements: Input[], 
            closure: (elem: Input, index: number, array: Input[]) => Promise<Output>
        ): Promise<Output[]>
    {
        const ret: Output[] = [];
        for (let i: number = 0; i < elements.length; ++i)
            ret.push(await closure(elements[i], i, elements));
        
        return ret;
    }

    export async function asyncRepeat<T>(count: number, closure: (index: number) => Promise<T>): Promise<T[]>
    {
        const ret: T[] = [];
        for (let i: number = 0; i < count; ++i)
            ret.push(await closure(i));
        return ret;
    }

    export function has<T>(elements: T[], pred: (elem: T) => boolean): boolean
    {
        return elements.find(pred) !== undefined;
    }

    export function repeat<T>(count: number, closure: (index: number) => T): T[]
    {
        const ret: T[] = [];
        for (let i: number = 0; i < count; ++i)
            ret.push(closure(i));
        return ret;
    }
}