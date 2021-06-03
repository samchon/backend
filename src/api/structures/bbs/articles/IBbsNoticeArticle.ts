import { IBbsManager } from "../actors/IBbsManager";
import { IBbsArticle } from "./IBbsArticle";

export interface IBbsNoticeArticle extends IBbsArticle<IBbsNoticeArticle.IContent>
{
    manager: IBbsManager.IReference;
    hit: number;
}

export namespace IBbsNoticeArticle
{
    export type IRequest = IBbsArticle.IRequest<IRequest.ISearch>;
    export namespace IRequest
    {
        export import ISearch = IBbsArticle.IRequest.ISearch;
    }
    
    export interface ISummary extends IBbsArticle.ISummary
    {
        manager: string;
        hit: number;
    }

    export import IContent = IBbsArticle.IContent;
    export import IStore = IBbsArticle.IStore;
    export import IUpdate = IBbsArticle.IUpdate;
}