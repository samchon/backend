import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "./BbsArticle";
import { BbsCustomer } from "../actors/BbsCustomer";

@orm.Entity()
export class BbsReviewArticle extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @safe.Belongs.OneToOne(() => BbsArticle, 
        base => base.review,
        "uuid",
        "id",
        { primary: true }
    )
    public readonly base!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @safe.Belongs.ManyToOne
    (
        () => BbsCustomer as safe.Model.Creator<BbsCustomer<true>>,
        customer => customer.reviewArticles,
        "uuid",
        "bbs_customer_id",
        { index: true }
    )
    public readonly customer!: safe.Belongs.ManyToOne<BbsCustomer<true>, "uuid">;

    @orm.Column("varchar")
    public readonly brand!: string;

    @orm.Column("varchar")
    public readonly manufacturer!: string;
    
    @orm.Column("varchar")
    public readonly product!: string;

    @orm.Column("datetime")
    public readonly purchased_at!: Date;
}