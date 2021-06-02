import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "./BbsArticle";
import { BbsCustomer } from "../actors/BbsCustomer";
import { BbsAnswerArticle } from "./BbsAnswerArticle";

@orm.Entity()
export class BbsQuestionArticle extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @safe.Belongs.OneToOne(() => BbsArticle, 
        base => base.question,
        "uuid",
        "id",
        { primary: true }
    )
    public readonly base!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @safe.Belongs.ManyToOne
    (
        () => BbsCustomer as safe.Model.Creator<BbsCustomer<true>>,
        customer => customer.questionArticles,
        "uuid",
        "bbs_customer_id",
        { index: true }
    )
    public readonly customer!: safe.Belongs.ManyToOne<BbsCustomer<true>, "uuid">;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToOne
    (
        () => BbsAnswerArticle, 
        answer => answer.question
    )
    public readonly answer!: safe.Has.OneToOne<BbsAnswerArticle>;
}