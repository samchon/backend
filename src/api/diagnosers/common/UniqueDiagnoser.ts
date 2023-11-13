import { IDiagnosis } from "../../structures/common/IDiagnosis";

/**
 * Diagnoser of uniqueness.
 *
 * Finds every duplicated elements.
 *
 * @author Samchon
 */
export namespace UniqueDiagnoser {
  /**
   * Configuration info.
   */
  export interface IConfig<Element> {
    /**
     * Key getter function.
     */
    key(x: Element): string;

    /**
     * Message generator when duplicated element be found.
     */
    message(elem: Element, index: number): IDiagnosis;

    /**
     * Filter function returning only target elements.
     *
     * @default undefined Accept every elements
     */
    filter?(elem: Element): boolean;
  }

  /**
   * Diagnose duplicated elements.
   *
   * Diagnose duplicated elements through {@link HashSet} and returns
   * {@link IDiagnosis} objects describing about the duplicated elements.
   *
   * @param config Configuration info for diagnosing
   * @returns Diagnoser function for specific elements
   */
  export const validate =
    <Element>(config: IConfig<Element>) =>
    /**
     * @param elements Target elements to validate.
     * @returns List of diagnoses messages about duplicated elements
     */
    (elements: Element[]) => {
      const output: IDiagnosis[] = [];
      const set: Set<string> = new Set();

      elements.forEach((elem, index) => {
        if (config.filter && config.filter(elem) === false) return;

        const key: string = config.key(elem);
        if (set.has(key) === true) output.push(config.message(elem, index));
        else set.add(key);
      });
      return output;
    };
}
