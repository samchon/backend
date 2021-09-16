import { IBbsCustomer } from "../actors/IBbsCustomer";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsReviewArticle extends IBbsArticle<IBbsReviewArticle.IContent>
{
    customer: IBbsCustomer;
    brand: string;
    manufacturer: string;
    product: string;
    hit: number;
    purchased_at: string;
}

export namespace IBbsReviewArticle
{
    export type IRequest = IBbsArticle.IRequest<IRequest.ISearch>;
    export namespace IRequest
    {
        export interface ISearch extends IBbsArticle.IRequest.ISearch
        {
            brand?: string;
            manufacturer?: string;
            product?: string;
            score_min?: number;
            score_max?: number;
        }
    }
    export interface ISummary extends IBbsArticle.ISummary
    {
        customer: string;
        brand: string;
        manufacturer: string;
        product: string;
        score: number;
    }

    export interface IContent extends IBbsArticle.IContent
    {
        score: number;
    }
    export interface IStore extends IBbsArticle.IStore
    {
        brand: string;
        manufacturer: string;
        product: string;
        purchased_at: string;
        score: number;
    }
    export interface IUpdate extends IBbsArticle.IUpdate
    {
        score: number;
    }
}