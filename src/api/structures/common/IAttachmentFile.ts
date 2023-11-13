import { tags } from "typia";

/**
 * Attachment File.
 *
 * Every attachment files that are managed in current system.
 *
 * For reference, it is possible to omit one of file {@link name}
 * or {@link extension} like `.gitignore` or `README` case, but not
 * possible to omit both of them.
 */
export interface IAttachmentFile extends IAttachmentFile.IStore {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * Creation time of attachment file.
   */
  created_at: string & tags.Format<"date-time">;
}

export namespace IAttachmentFile {
  export interface IStore {
    /**
     * File name, except extension.
     *
     * Possible to omit like `.gitignore` case.
     */
    name: null | (string & tags.MinLength<1> & tags.MaxLength<255>);

    /**
     * Extension.
     *
     * Possible to omit like `README` case.
     */
    extension: null | (string & tags.MinLength<1> & tags.MaxLength<8>);

    /**
     * URL path of the real file.
     */
    url: string & tags.Format<"url">;
  }
}
