import { IBbsArticle } from "./IBbsArticle";
import { IBbsAnswerArticle } from "./IBbsAnswerArticle";
import { IBbsCustomer } from "../actors/IBbsCustomer";

export interface IBbsQuestionArticle extends IBbsArticle<IBbsQuestionArticle.IContent>
{
    customer: IBbsCustomer<true>;
    answer: IBbsAnswerArticle | null;
    hit: number;
}

export namespace IBbsQuestionArticle
{
    export type IRequest = IBbsArticle.IRequest<IRequest.ISearch>;
    export namespace IRequest
    {
        export interface ISearch extends IBbsArticle.IRequest.ISearch
        {
            answered?: boolean;
        }
    }
    export interface ISummary extends IBbsArticle.ISummary
    {
        customer: string;
        answer: IBbsAnswerArticle.ISummary | null;
    }

    export import IContent = IBbsArticle.IContent;
    export import IStore = IBbsArticle.IStore;
    export import IUpdate = IBbsArticle.IUpdate;
}