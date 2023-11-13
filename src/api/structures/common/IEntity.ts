import { tags } from "typia";

/**
 * Commen Entity.
 *
 * Common entity definition for entities having UUID type primary key value.
 *
 * @author Samchon
 */
export interface IEntity {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;
}
