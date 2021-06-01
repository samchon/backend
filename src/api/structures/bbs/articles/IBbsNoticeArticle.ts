import { IBbsSectionManager } from "../actors/IBbsSectionManager";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsNoticeArticle extends IBbsArticle<IBbsNoticeArticle.IContent>
{
    manager: IBbsSectionManager;
}

export namespace IBbsNoticeArticle
{
    export interface ISummary extends IBbsArticle.ISummary
    {
        manager: string;
    }
    export import IContent = IBbsArticle.IContent;
}