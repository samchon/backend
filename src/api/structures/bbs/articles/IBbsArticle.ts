import { IPage } from "../../common/IPage";
import { IAttachmentFile } from "../../misc/IAttachmentFile";

export interface IBbsArticle<Content extends IBbsArticle.IContent>
{
    id: string;
    contents: Content[];
    created_at: string;
}

export namespace IBbsArticle
{
    export interface IRequest<Search extends IRequest.ISearch> 
        extends IPage.IRequest
    {
        search: Search | null;
    }
    export namespace IRequest
    {
        export interface ISearch
        {
            writer?: string;
            title?: string;
            body?: string;
        }
    }
    export interface ISummary
    {
        id: string;
        title: string;
        hit: number;
        created_at: string;
        updated_at: string;
    }

    export interface IContent
    {
        id: string;
        title: string;
        body: string;
        files: IAttachmentFile[];
        created_at: string;
    }
    export interface IStore
    {
        title: string;
        body: string;
        files: IAttachmentFile[];
    }
    export type IUpdate = IStore;
}