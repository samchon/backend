import { tags } from "typia";

import { IAttachmentFile } from "./IAttachmentFile";
import { IPage } from "./IPage";

/**
 * Comment written on an article.
 *
 * `IBbsArticleComment` is an entity that shapes the comments written on an article.
 *
 * And for this comment, as in the previous relationship between
 * {@link IBbsArticle} and {@link IBbsArticle.ISnapshot}, the content body of the
 * comment is stored in the sub {@link IBbsArticleComment.ISnapshot} table for
 * evidentialism, and a new snapshot record is issued every time the comment is modified.
 *
 * Also, `IBbsArticleComment` is expressing the relationship of the hierarchical reply
 * structure through the {@link IBbsArticleComment.parent_id} attribute.
 *
 * @author Samchon
 */
export interface IBbsArticleComment<
  Snapshot extends IBbsArticleComment.ISnapshot = IBbsArticleComment.ISnapshot,
> {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Parent comment's ID.
   */
  parent_id: null | (string & tags.Format<"uuid">);

  /**
   * List of snapshot contents.
   *
   * It is created for the first time when a comment being created, and is
   * accumulated every time the comment is modified.
   */
  snapshots: Snapshot[] & tags.MinItems<1>;

  /**
   * Creation time of comment.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IBbsArticleComment {
  export type Format = "TEXT" | "MARKDOWN" | "HTML";

  export interface IRequest<
    Search extends IRequest.ISearch = IRequest.ISearch,
    Sortable extends string = IRequest.SortableColumns,
  > extends IPage.IRequest {
    search?: Search;
    sort?: IPage.Sort<Sortable>;
  }
  export namespace IRequest {
    export interface ISearch {
      body?: string;
    }
    export type SortableColumns = "created_at";
  }

  /**
   * Snapshot of comment.
   *
   * `IBbsArticleComment.ISnapshot` is a snapshot entity that contains
   * the contents of the comment.
   *
   * As mentioned in {@link IBbsArticleComment}, designed to keep evidence
   * and prevent fraud.
   */
  export interface ISnapshot extends IStore {
    /**
     * Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * Creation time of snapshot record.
     *
     * In other words, creation time or update time or comment.
     */
    created_at: string & tags.Format<"date-time">;
  }

  export interface IStore {
    /**
     * Format of body.
     *
     * Same meaning with extension like `html`, `md`, `txt`.
     */
    format: Format;

    /**
     * Content body of comment.
     */
    body: string;

    /**
     * List of attachment files.
     */
    files: IAttachmentFile.IStore[];
  }

  export type IUpdate = IStore;
}
