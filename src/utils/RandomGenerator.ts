import { back_inserter } from "tstl/iterator/factory";
import { randint } from "tstl/algorithm/random";
import { sample as _Sample } from "tstl/ranges/algorithm/random";

import { ArrayUtil } from "./ArrayUtil";

export namespace RandomGenerator
{
    /* ----------------------------------------------------------------
        IDENTIFICATIONS
    ---------------------------------------------------------------- */
    const CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    export function alphabets(length: number): string
    {
        let ret: string = "";
        for (let i: number = 0; i < length; ++i)
        {
            let index: number = randint(9, CHARACTERS.length - 1);
            ret += CHARACTERS[index];
        }
        return ret;
    }

    export function name(length: number = 3): string
    {
        let ret: string = "";
        for (let i: number = 0; i < length; ++i)
            ret += String.fromCharCode(randint(44031, 55203));
        
        return ret;
    }

    export function paragraph(sentences: number, wordMin: number = 1, wordMax: number = 7): string
    {
        return ArrayUtil
            .repeat(sentences, () => name(randint(wordMin, wordMax)))
            .join(" ");
    }

    export function content
        (
            paragraphes: number, 
            sentenceMin: number = 10, 
            sentenceMax: number = 40,
            wordMin: number = 1, 
            wordMax: number = 7
        ): string
    {
        return ArrayUtil
            .repeat(paragraphes, () => paragraph(randint(sentenceMin, sentenceMax), wordMin, wordMax))
            .join("\n\n");
    }

    export function partial(content: string): string
    {
        const first: number = randint(0, content.length - 1);
        const last: number = randint(first + 1, content.length);

        return content.substring(first, last).trim();
    }

    export function mobile(): string
    {
        return `8210${digit(3, 4)}${digit(4, 4)}`;
    }

    export function digit(minC: number, maxC: number): string
    {
        let val: number = randint(0, Math.pow(10.0, maxC) - 1);
        let ret: string = val.toString();

        let log10: number = val ? Math.floor(Math.log10(val)) + 1 : 0;
        if (log10 < minC)
            for (let i: number = 0; i < minC - log10; ++i)
                ret = "0" + ret;

        return ret;
    }

    export function date(from: Date, range: number): Date
    {
        const time: number = from.getTime() + randint(0, range);
        return new Date(time);
    }

    export function sample<T>(array: T[], count: number): T[]
    {
        const ret: T[] = [];
        _Sample(array, back_inserter(ret), count);
        return ret;
    }

    export function pick<T>(array: T[]): T
    {
        return array[randint(0, array.length - 1)];
    }
}