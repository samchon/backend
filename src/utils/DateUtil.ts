export namespace DateUtil
{
    export function to_string(date: Date, hms: boolean = false): string
    {
        let ret: string = `${date.getFullYear()}-${_To_cipher_string(date.getMonth()+1)}-${_To_cipher_string(date.getDate())}`;
        if (hms === true)
            ret += ` ${_To_cipher_string(date.getHours())}:${_To_cipher_string(date.getMinutes())}:${_To_cipher_string(date.getSeconds())}`;
        
        return ret;
    }

    export interface IDifference
    {
        year: number;
        month: number;
        date: number;
    }

    export function diff(x: Date | string, y: Date | string): IDifference
    {
        x = _To_date(x);
        y = _To_date(y);

        // FIRST DIFFERENCES
        let ret: IDifference = 
        {
            year: x.getFullYear() - y.getFullYear(),
            month: x.getMonth() - y.getMonth(),
            date: x.getDate() - y.getDate()
        };

        //----
        // HANDLE NEGATIVE ELEMENTS
        //----
        // DATE
        if (ret.date < 0)
        {
            let last: number = last_date(y.getFullYear(), y.getMonth());

            --ret.month;
            ret.date = x.getDate() + (last - y.getDate());
        }
        
        // MONTH
        if (ret.month < 0)
        {
            --ret.year;
            ret.month = 12 + ret.month;
        }
        return ret;
    }

    export function last_date(year: number, month: number): number
    {
        // LEAP MONTH
        if (month == 1 && year % 4 == 0 && !(year % 100 == 0 && year % 400 != 0))
            return 29;
        else
            return LAST_DATES[month];
    }

    export function add_years(date: Date, value: number): Date
    {
        date = new Date(date);
        date.setFullYear(date.getFullYear() + value);
        
        return date;
    }

    export function add_months(date: Date, value: number): Date
    {
        date = new Date(date);

        let newYear: number = date.getFullYear() + Math.floor((date.getMonth() + value) / 12);
        let newMonth: number = (date.getMonth() + value) % 12;
        let lastDate: number = last_date(newYear, newMonth - 1);

        if (lastDate < date.getDate())
            date.setDate(lastDate);

        date.setMonth(value - 1);
        return date;
    }

    export function add_days(date: Date, value: number): Date
    {
        date = new Date();
        date.setDate(date.getDate() + value);

        return date;
    }

    function _To_date(date: string | Date): Date
    {
        if (date instanceof Date)
            return date;
        else
            return new Date(date);
    }
    function _To_cipher_string(val: number): string
    {
        if (val < 10)
            return "0" + val;
        else
            return String(val);
    }
    const LAST_DATES: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}