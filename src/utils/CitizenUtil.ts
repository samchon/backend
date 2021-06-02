import { InvalidArgument } from "tstl/exception/InvalidArgument";

export namespace CitizenUtil
{
    export function mobile(str: string): string
    {
        // STANDARDIZE
        str = str.trim();
        for (const delimiter of MOBILE_DELIMITERS)
            str = str.split(delimiter).join("");

        // VALIDATE
        if (str.match(/^\d+$/) === null)
            throw new InvalidArgument("Error on CitizenUtil.mobile(): invalid mobile number has been detected.");

        // RETURNS
        return str;
    }

    const MOBILE_DELIMITERS = [" ", "-", ")"];
}