import { IAttachmentFile } from "../IAttachmentFile";

/**
 * 게시물의 댓글.
 * 
 * @author Samchon
 */
export interface IBbsArticleComment
    extends IBbsArticleComment.IStore
{
    /**
     * Primary Key.
     */
    id: string;

    /**
     * 댓글 생성일시.
     */
    created_at: string;
}
export namespace IBbsArticleComment
{
    export type Format = "TEXT" | "MARKDOWN" | "HTML";

    export interface IStore
    {
        /**
         * 본문의 데이터 포맷.
         */
        format: Format;

        /**
         * 댓글 본문.
         */
        content: string;

        /**
         * 첨부파일 리스트.
         */
        files: IAttachmentFile.IStore[];
    }
}