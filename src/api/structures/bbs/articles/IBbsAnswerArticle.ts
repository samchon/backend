import { IBbsManager } from "../actors/IBbsManager";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsAnswerArticle
    extends IBbsArticle<IBbsAnswerArticle.IContent>
{
    manager: IBbsManager.IReference;
    hit: number;
}

export namespace IBbsAnswerArticle
{
    export interface ISummary extends IBbsArticle.ISummary
    {
        manager: string;
    }
    export import IContent = IBbsArticle.IContent;
    export import IStore = IBbsArticle.IStore;
    export import IUpdate = IBbsArticle.IUpdate;
}