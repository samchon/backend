import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "../../tables/bbs/articles/BbsArticle";
import { SyncSingleton } from "../../../utils/SyncSingleton";

@orm.Entity()
export class __MvBbsArticleHit extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @safe.Belongs.OneToOne(() => BbsArticle,
        article => article.__mv_hit,
        "uuid",
        "bbs_article_id",
        { primary: true }
    )
    public readonly article!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @orm.Column("int", { unsigned: true })
    public readonly count!: number;

    /* -----------------------------------------------------------
        PROCEDURE
    ----------------------------------------------------------- */
    public static async increments
        (
            manager: orm.EntityManager,
            article: safe.typings.ModelLike<BbsArticle, "uuid", false>
        ): Promise<void>
    {
        await manager.query(SQL.get(), [ article.id ]);
    }
}

const SQL: SyncSingleton<string> = new SyncSingleton(() =>
{
    const table: string = __MvBbsArticleHit.getRepository().metadata.tableName;
    return `UPDATE ${table} SET count = count + 1 WHERE shopping_sale_id = ?`;
});