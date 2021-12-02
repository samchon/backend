/**
 * @packageDocumentation
 * @module api.structures.common
 */
//================================================================
/**
 * A page.
 * 
 * Collection of records with pagination indformation.
 * 
 * @author Samchon
 */
export interface IPage<T extends object>
{
    /**
     * Page information.
     */
    pagination: IPage.IPagination;

    /**
     * List of records.
     */
    data: T[];
}
export namespace IPage
{
    /**
     * Page information.
     */
    export interface IPagination
    {
        /**
         * Current page number.
         */
        page: number;

        /**
         * Limitation of records per a page.
         * 
         * @default 100
         */
        limit: number;

        /**
         * Total records in the database.
         */
        total_count: number;

        /**
         * Total pages.
         * 
         * Equal to {@link total_count} / {@link limit} with ceiling.
         */
        total_pages: number;
    }

    /**
     * Page request data
     */
    export interface IRequest
    {
        /**
         * Page number.
         */
        page?: number;

        /**
         * Limitation of records per a page.
         */
        limit?: number;
    }
    export namespace IRequest
    {
        /**
         * Sorting column specialization.
         * 
         * The plus means ascending order and the minus means descending order.
         */
        export type Sort<Literal extends string> = Array<`-${Literal}` | `+${Literal}`>;
    }
}