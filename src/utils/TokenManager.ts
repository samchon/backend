import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { randint } from "tstl/algorithm/random";
import { v4 } from "uuid";

export namespace TokenManager {
    export const options = {
        duration: 3 * 60 * 60 * 1000,
    };

    export interface IOutput {
        value: string;
        expired_at: number;
    }

    export interface IProps {
        table: string;
        writable: boolean;
        duration?: number;
    }

    export interface IPayload {
        table: string;
        id: string;
        writable: boolean;
        expired_at: number;
    }

    export const generate =
        (props: IProps) =>
        (id: string): IOutput => {
            const expired_at: number = new Date(
                Date.now() + (props.duration ?? options.duration),
            ).getTime();
            const payload: IPayload = {
                [v4()]: v4(),
                id,
                table: props.table,
                writable: props.writable,
                expired_at,
                [v4()]: randint(10000, 100000),
            };

            // RETURNS WITH ENCRYPTION
            const iv: string = _Get_iv(props.table);
            return {
                value: AesPkcs5.encrypt(
                    JSON.stringify(payload),
                    ENCRYPT_KEY,
                    iv,
                ),
                expired_at,
            };
        };

    export const refresh =
        (props: Pick<IProps, "table" | "duration">) =>
        (token: string): IOutput | null => {
            // PARSE PAYLOAD
            const payload: IPayload | null = validate(props.table)(token);
            if (payload === null) return null;

            // RE-GENERATE TOKEN
            return generate({
                writable: payload.writable,
                ...props,
            })(payload.id);
        };

    export const validate =
        (table: string) =>
        (token: string): IPayload | null => {
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
            else if (payload.expired_at < Date.now()) return null;
            return payload;
        };

    function _Get_iv(table: string): string {
        if (table.length > 16) table = table.substr(0, 16);
        else if (table.length < 16)
            table = table + "_".repeat(16 - table.length);

        return table;
    }

    const ENCRYPT_KEY = "fvXOJ3unu76SAijPnJG6VoKiqFOFqvr6";
}
