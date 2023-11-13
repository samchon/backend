export namespace EqualDiagnoser {
  export const covered =
    <T>(x: T) =>
    (y: T): boolean =>
      any_equal_to(x, y);
}

function any_equal_to(x: any, y: any): boolean {
  if (typeof x !== typeof y) return false;
  else if (x instanceof Array)
    if (!(y instanceof Array)) return false;
    else return array_equal_to(x, y);
  else if (typeof x === "object") return object_equal_to(x, y);
  else return x === y;
}

function array_equal_to(x: any[], y: any[]): boolean {
  if (x.length !== y.length) return false;
  return x.every((xItem, i) => any_equal_to(xItem, y[i]));
}

function object_equal_to(x: any, y: any): boolean {
  if (x === null) return y === null;
  for (const key in x) if (!any_equal_to(x[key], y[key])) return false;
  return true;
}
