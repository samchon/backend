import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticleContent } from "./BbsArticleContent";

@orm.Entity()
export class BbsReviewArticleContent extends safe.Model
{
    @safe.Belongs.OneToOne(() => BbsArticleContent, 
        base => base.reviewContent,
        "uuid",
        "id",
        { primary: true }
    )
    public readonly base!: safe.Belongs.OneToOne<BbsArticleContent, "uuid">;

    @orm.Column("double")
    public readonly score!: number;
}