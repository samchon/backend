import nest from "@modules/nestjs";
import { AesPkcs5 } from "@nestia/fetcher";
import { randint } from "tstl/algorithm/random";
import { Pair } from "tstl/utility/Pair";
import { v4 } from "uuid";

export namespace TokenManager {
    export const options = {
        duration: 3 * 60 * 60 * 1000,
    };

    export function generate(
        table: string,
        id: string,
        writable: boolean,
        duration: number = options.duration,
    ): Pair<string, Date> {
        // PAYLOAD DATA WITH CONFUSER
        const expired_at: Date = new Date(Date.now() + duration);
        const payload: IPayload = {
            [v4()]: v4(),
            table,
            id,
            writable,
            expired_at: expired_at.getTime(),
            [v4()]: randint(10000, 100000),
        };

        // RETURNS WITH ENCRYPTION
        const iv: string = _Get_iv(table);
        return new Pair(
            AesPkcs5.encrypt(JSON.stringify(payload), ENCRYPT_KEY, iv),
            expired_at,
        );
    }

    export function refresh(
        table: string,
        token: string,
        writable: boolean,
        duration: number,
    ): Pair<string, Date> | null {
        // PARSE PAYLOAD
        const payload: IPayload | null = _Parse(table, token);
        if (payload === null) return null;

        // RE-GENERATE TOKEN
        return generate(table, payload.id, writable, duration);
    }

    export function parse(
        table: string,
        token: string,
    ): Pair<string, boolean> | null {
        const payload: IPayload | null = _Parse(table, token);
        return payload !== null ? new Pair(payload.id, payload.writable) : null;
    }

    /* -----------------------------------------------------------
        HIDDEN MEMBERS
    ----------------------------------------------------------- */
    function _Parse(table: string, token: string): IPayload | null {
        // INITIALIZATION VECTOR
        const iv: string = _Get_iv(table);

        // PARSE PAYLOAD
        const closure = () => {
            try {
                const content: string = AesPkcs5.decrypt(
                    token,
                    ENCRYPT_KEY,
                    iv,
                );
                const payload: IPayload = JSON.parse(content);
                return payload;
            } catch {
                return null;
            }
        };
        const payload: IPayload | null = closure();
        if (payload === null) return null;

        // JUDGEMENT
        if (payload.table !== table) return null;
        else if (payload.expired_at < Date.now())
            throw new nest.ForbiddenException("Your token has been expired.");
        else return payload;
    }

    function _Get_iv(table: string): string {
        if (table.length > 16) table = table.substr(0, 16);
        else if (table.length < 16)
            table = table + "_".repeat(16 - table.length);

        return table;
    }

    const ENCRYPT_KEY = "fvXOJ3unu76SAijPnJG6VoKiqFOFqvr6";

    interface IPayload {
        table: string;
        id: string;
        writable: boolean;
        expired_at: number;
    }
}
