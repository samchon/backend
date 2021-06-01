import { IBbsConsumer } from "../actors/IBbsCustomer";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsReviewArticle extends IBbsArticle<IBbsReviewArticle.IContent>
{
    consumer: IBbsConsumer;
    brand: string;
    manufacturer: string;
    product: string;
    score: number;
    purchased_at: string;
}

export namespace IBbsReviewArticle
{
    export interface ISummary extends IBbsArticle.ISummary
    {
        consumer: string;
        brand: string;
        manufacturer: string;
        product: string;
        score: number;
    }

    export interface IContent extends IBbsArticle.IContent
    {
        score: string;
    }

    export interface IStore extends IContent
    {
        brand: string;
        manufacturer: string;
        produdct: string;
        purchased_at: string;
    }

    export type IUpdate = IContent;
}