import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "./BbsArticle";
import { BbsCustomer } from "../actors/BbsCustomer";

@orm.Entity()
export class BbsFreeArticle extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @safe.Belongs.OneToOne(() => BbsArticle, 
        base => base.free,
        "uuid",
        "id",
        { primary: true }
    )
    public readonly base!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @safe.Belongs.ManyToOne
    (
        () => BbsCustomer,
        customer => customer.freeArticles,
        "uuid",
        "bbs_customer_id",
        { index: true }
    )
    public readonly customer!: safe.Belongs.ManyToOne<BbsCustomer, "uuid">;
}