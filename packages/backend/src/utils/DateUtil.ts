export namespace DateUtil {
  export const SECOND = 1_000;
  export const MINUTE = 60 * SECOND;
  export const HOUR = 60 * MINUTE;
  export const DAY = 24 * HOUR;
  export const WEEK = 7 * DAY;
  export const MONTH = 30 * DAY;

  export function toString(date: Date, hms: boolean = false): string {
    const ymd: string = [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    ]
      .map((value) => _To_cipher_string(value))
      .join("-");
    if (hms === false) return ymd;

    return (
      `${ymd} ` +
      [date.getHours(), date.getMinutes(), date.getSeconds()]
        .map((value) => _To_cipher_string(value))
        .join(":")
    );
  }

  // export function to_uuid(date: Date = new Date()): string {
  //     const elements: number[] = [
  //         date.getFullYear(),
  //         date.getMonth() + 1,
  //         date.getDate(),
  //         date.getHours(),
  //         date.getMinutes(),
  //         date.getSeconds(),
  //     ];
  //     return (
  //         elements.map((value) => _To_cipher_string(value)).join('') +
  //         ':' +
  //         Math.random().toString().substr(2)
  //     );
  // }

  export interface IDifference {
    year: number;
    month: number;
    date: number;
  }

  export function diff(x: Date | string, y: Date | string): IDifference {
    x = _To_date(x);
    y = _To_date(y);

    // FIRST DIFFERENCES
    const ret: IDifference = {
      year: x.getFullYear() - y.getFullYear(),
      month: x.getMonth() - y.getMonth(),
      date: x.getDate() - y.getDate(),
    };

    //----
    // HANDLE NEGATIVE ELEMENTS
    //----
    // DATE
    if (ret.date < 0) {
      const last: number = lastDate(y.getFullYear(), y.getMonth());

      --ret.month;
      ret.date = x.getDate() + (last - y.getDate());
    }

    // MONTH
    if (ret.month < 0) {
      --ret.year;
      ret.month = 12 + ret.month;
    }
    return ret;
  }

  export function lastDate(year: number, month: number): number {
    // LEAP MONTH
    if (month == 1 && year % 4 == 0 && !(year % 100 == 0 && year % 400 != 0))
      return 29;
    else return LAST_DATES[month];
  }

  export function addYears(date: Date, value: number): Date {
    date = new Date(date);
    date.setFullYear(date.getFullYear() + value);

    return date;
  }

  export function addMonths(date: Date, value: number): Date {
    date = new Date(date);

    const year: number =
      date.getFullYear() + Math.floor((date.getMonth() + value) / 12);
    const month: number = (date.getMonth() + value) % 12;
    const last: number = lastDate(year, month - 1);

    if (last < date.getDate()) date.setDate(last);

    date.setMonth(value - 1);
    return date;
  }

  export function addDays(date: Date, value: number): Date {
    date = new Date();
    date.setDate(date.getDate() + value);

    return date;
  }

  function _To_date(date: string | Date): Date {
    if (date instanceof Date) return date;
    else return new Date(date);
  }
  function _To_cipher_string(val: number): string {
    if (val < 10) return "0" + val;
    else return String(val);
  }
  const LAST_DATES: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}
