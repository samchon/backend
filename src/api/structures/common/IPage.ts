 export interface IPage<T extends object>
 {
     pagination: IPage.IPagination;
     data: T[];
 }
 export namespace IPage
 {
     export interface IPagination
     {
         page: number;
         limit: number;
         total_count: number;
         total_pages: number;
     }
 
     export interface IRequest
     {
         page?: number;
         limit?: number;
         sort?: string[];
     }
 }