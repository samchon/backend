import { IBbsArticle } from "./IBbsArticle";
import { IBbsAnswerArticle } from "./IBbsAnswerArticle";
import { IBbsConsumer } from "../actors/IBbsCustomer";

export interface IBbsQuestionArticle extends IBbsArticle<IBbsQuestionArticle.IContent>
{
    customer: IBbsConsumer;
    answer: IBbsAnswerArticle | null;
    secret: boolean;
}

export namespace IBbsQuestionArticle
{
    export interface ISummary extends IBbsArticle.ISummary
    {
        customer: string;
        secret: boolean;
        answered_at: string | null;
    }
    export import IContent = IBbsArticle.IContent;
}