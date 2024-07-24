import serializeError = require("serialize-error");

export namespace ErrorUtil {
  export function toJSON(err: any): object {
    return err instanceof Object && err.toJSON instanceof Function
      ? err.toJSON()
      : serializeError(err);
  }
}
