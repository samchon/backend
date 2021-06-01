import { IPage } from "../../common/IPage";
import { IAttachmentFile } from "../../misc/IAttachmentFile";

export interface IBbsArticle<Content extends IBbsArticle.IContent>
{
    id: string;
    contents: Content[];
}

export namespace IBbsArticle
{
    export interface IRequest extends IPage.IRequest
    {
        writer?: string;
        title?: string;
        body?: string;
    }

    export interface ISummary
    {
        id: string;
        title: string;
        created_at: string;
        updated_at: string;
    }

    export interface IContent
    {
        title: string;
        body: string;
        file: IAttachmentFile[];
    }
}