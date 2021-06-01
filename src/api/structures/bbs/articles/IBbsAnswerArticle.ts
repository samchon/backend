import { IBbsSectionManager } from "../actors/IBbsSectionManager";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsAnswerArticle
    extends IBbsArticle<IBbsAnswerArticle.IContent>
{
    manager: IBbsSectionManager;
}

export namespace IBbsAnswerArticle
{
    export interface ISummary
    {
        manager: string;
    }

    export import IContent = IBbsArticle.IContent;
}