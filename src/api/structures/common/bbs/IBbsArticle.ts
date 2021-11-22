import { IAttachmentFile } from "../IAttachmentFile";

/**
 * 모든 게시물ㄹ의 슈퍼타입.
 * 
 * @template Content 게시물의 컨텐츠 타입
 * @author Samchon
 */
export interface IBbsArticle<Content extends IBbsArticle.IContent = IBbsArticle.IContent>
{
    /**
     * Primary Key.
     */
    id: string;

    /**
     * 컨텐츠 리스트.
     * 
     * 모든 수정 및 편집 내역을 기록하여 증거를 남긴다.
     */
    contents: Content[];

    /**
     * 게시물 작성일시.
     */
    created_at: string;
}
export namespace IBbsArticle
{
    export type Format = "TEXT" | "MARKDOWN" | "HTML";

    /**
     * 게시물 요약 정보.
     */
    export interface ISummary
    {
        /**
         * Primary Key.
         */
        id: string;

        /**
         * 제목.
         */
        title: string;

        /**
         * 게시물 작성일시.
         */
        created_at: string;

        /**
         * 게시물 수정일시.
         */
        updated_at: string;
    }

    /**
     * 게시물 축약 정보.
     */
    export interface IAbridge
        extends ISummary, IStore
    {
    }

    /**
     * 게시물 입력 정보.
     */
    export interface IStore
    {
        /**
         * 컨텐츠의 데이터 포맷.
         */
        format: Format;

        /**
         * 제목.
         */
        title: string;

        /**
         * 본문.
         */
        body: string;

        /**
         * 첨부파일 리스트.
         */
        files: IAttachmentFile.IStore[];
    }

    /**
     * 게시물 컨텐츠 정보.
     */
    export interface IContent extends IStore
    {
        /**
         * Primary Key.
         */
        id: string;

        /**
         * 게시물 작성 또는 수정 일시.
         */
        created_at: string;
    }
}