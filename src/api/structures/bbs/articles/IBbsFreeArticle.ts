import { IBbsCustomer } from "../actors/IBbsCustomer";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsFreeArticle extends IBbsArticle<IBbsFreeArticle.IContent>
{
    customer: IBbsCustomer;
    hit: number;
}

export namespace IBbsFreeArticle
{
    export type IRequest = IBbsArticle.IRequest<IRequest.ISearch>;
    export namespace IRequest
    {
        export import ISearch = IBbsArticle.IRequest.ISearch;
    }
    export interface ISummary extends IBbsArticle.ISummary
    {
        customer: string;
        hit: number;
    }

    export import IContent = IBbsArticle.IContent;
    export import IStore = IBbsArticle.IStore;
    export import IUpdate = IBbsArticle.IUpdate;
}