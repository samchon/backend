import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "./BbsArticle";
import { BbsQuestionArticle } from "./BbsQuestionArticle";
import { BbsManager } from "../actors/BbsManager";

@orm.Entity()
export class BbsAnswerArticle extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @safe.Belongs.OneToOne(() => BbsArticle,
        base => base.answer,
        "uuid",
        "id",
        { primary: true }
    )
    public readonly base!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @safe.Belongs.OneToOne(() => BbsQuestionArticle,
        question => question.answer,
        "uuid",
        "bbs_question_article_id",
        { unique: true }
    )
    public readonly question!: safe.Belongs.OneToOne<BbsQuestionArticle, "uuid">;

    @safe.Belongs.ManyToOne(() => BbsManager,
        manager => manager.answers,
        "uuid",
        "bbs_manager_id",
        { index: true }
    )
    public readonly manager!: safe.Belongs.ManyToOne<BbsManager, "uuid">;
}