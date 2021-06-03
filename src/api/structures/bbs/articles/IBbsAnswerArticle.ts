import { IBbsManager } from "../actors/IBbsManager";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsAnswerArticle
    extends IBbsArticle<IBbsAnswerArticle.IContent>
{
    manager: IBbsManager.IReference;
}

export namespace IBbsAnswerArticle
{
    export interface ISummary
    {
        manager: string;
        title: string;
        created_at: string;
        updated_at: string | null;
    }
    export import IContent = IBbsArticle.IContent;
    export import IStore = IBbsArticle.IStore;
    export import IUpdate = IBbsArticle.IUpdate;
}