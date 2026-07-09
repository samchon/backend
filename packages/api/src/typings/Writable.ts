/**
 * @packageDocumentation
 * @module api.typings
 */
//================================================================
export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

export function Writable<T>(elem: Readonly<T>): Writable<T> {
  return elem;
}
