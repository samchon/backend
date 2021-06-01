import { IBbsConsumer } from "../actors/IBbsCustomer";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsFreeArticle extends IBbsArticle<IBbsFreeArticle.IContent>
{
    customer: IBbsConsumer;
}

export namespace IBbsFreeArticle
{
    export interface ISummary extends IBbsArticle.ISummary
    {
        customer: string;
    }
    export import IContent = IBbsArticle.IContent;
}