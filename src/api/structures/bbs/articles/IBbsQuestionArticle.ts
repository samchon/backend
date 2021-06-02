import { IBbsArticle } from "./IBbsArticle";
import { IBbsAnswerArticle } from "./IBbsAnswerArticle";
import { IBbsCustomer } from "../actors/IBbsCustomer";

export interface IBbsQuestionArticle extends IBbsArticle<IBbsQuestionArticle.IContent>
{
    customer: IBbsCustomer<true>;
    answer: IBbsAnswerArticle | null;
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
        answered_at: string | null;
    }

    export import IContent = IBbsArticle.IContent;
    export import IStore = IBbsArticle.IStore;
    export import IUpdate = IBbsArticle.IUpdate;
}