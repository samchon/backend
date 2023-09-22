import { tags } from "typia";

/**
 * Record Merge DTO.
 *
 * `IRecordMerge` is a structure for merging records.
 *
 * The `merge` means that merging multiple {@link IRecordMerge.merged}
 * records into {@link IRecordMerge.keep} instead of deleting
 * {@link IRecordMerge.merged} records.
 *
 * If there're some dependent tables of the target `table` having
 * unique constraint on foriegn key column, such dependent tables
 * also perform the merge process, too.
 *
 * Of course, if there're another dependent tables under those
 * dependents, they also perform the merge process recursively as well.
 * Such recursive merge process still works for self-recursive
 * (tree-structured) tables.
 *
 * @author Samchon
 */
export interface IRecordMerge {
    /**
     * Target record to keep after merging.
     *
     * After merge process, {@link merged} records would be merged into
     * this {@link keep} record.
     */
    keep: string & tags.Format<"uuid">;

    /**
     * To be merged to {@link keep} after merging.
     */
    merged: Array<string & tags.Format<"uuid">>;
}
