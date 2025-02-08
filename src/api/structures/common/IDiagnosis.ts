/**
 * Result of diagnosis.
 *
 * A diagnosis describing which error has been occurred.
 *
 * @author Samchon
 */
export interface IDiagnosis {
  /**
   * Access path of variable which caused the problem.
   */
  accessor: string;

  /**
   * Message of diagnosis.
   */
  message: string;
}
