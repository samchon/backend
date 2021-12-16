import { AesPkcs5 } from "safe-typeorm";
import { Pair } from "tstl/utility/Pair";
import { randint } from "tstl/algorithm/random";
import { v4 } from "uuid";

export namespace TokenManager
{
    export function generate
        (
            table: string, 
            id: string, 
            writable: boolean,
            duration: number
        ): string
    {
        // PAYLOAD DATA WITH CONFUSER
        const payload: IPayload = {
            [v4()]: v4(),
            table,
            id,
            writable,
            expired_at: Date.now() + duration,
            [v4()]: randint(10000, 100000)
        };

        // RETURNS WITH ENCRYPTION
        const iv: string = _Get_iv(table);
        return AesPkcs5.encrypt(JSON.stringify(payload), ENCRYPT_KEY, iv);
    }

    export function refresh(table: string, token: string, writable: boolean, duration: number): string | null
    {
        // PARSE PAYLOAD
        let iv: string = _Get_iv(table);
        let payload: IPayload | null = _Parse(table, token, iv);
        if (payload === null)
            return null;

        // RE-GENERATE TOKEN
        return generate(table, payload.id, writable, duration);
    }

    export function parse(table: string, token: string): Pair<string, boolean> | null
    {
        const payload: IPayload | null = _Parse(table, token);
        return (payload !== null)
            ? new Pair(payload.id, payload.writable)
            : null;
    }

    /* -----------------------------------------------------------
        HIDDEN MEMBERS
    ----------------------------------------------------------- */
    function _Parse(table: string, token: string, iv: string = _Get_iv(table)): IPayload | null
    {
        // PARSE PAYLOAD
        let payload: IPayload;
        try
        {
            let content: string = AesPkcs5.decrypt(token, ENCRYPT_KEY, iv);
            payload = JSON.parse(content);
        }
        catch
        {
            return null;
        }

        // JUDGEMENT
        return (payload.table !== table || payload.expired_at < Date.now())
            ? null
            : payload;
    }

    function _Get_iv(table: string): string
    {
        if (table.length > 16)
            table = table.substr(0, 16);
        else if (table.length < 16)
            table = table + "_".repeat(16 - table.length);

        return table;
    }

    const ENCRYPT_KEY = "12iDCMJDvwwCjYeJE6TSEDL8CQlJQcgN";

    interface IPayload
    {
        table: string;
        id: string;
        writable: boolean;
        expired_at: number;
    }
}