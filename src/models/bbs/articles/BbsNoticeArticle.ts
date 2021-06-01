import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsArticle } from "./BbsArticle";
import { BbsSectionManager } from "../actors/BbsSectionManager";

@orm.Entity()
export class BbsNoticeArticle extends safe.Model
{
    @safe.Belongs.OneToOne(() => BbsArticle, 
        base => base.notice,
        "uuid",
        "id",
        { primary: true }
    )
    public readonly base!: safe.Belongs.OneToOne<BbsArticle, "uuid">;

    @safe.Belongs.ManyToOne
    (
        () => BbsSectionManager,
        manager => manager.notices,
        "uuid",
        "bbs_section_manager_id",
        { index: true }
    )
    public readonly manager!: safe.Belongs.ManyToOne<BbsSectionManager, "uuid">;
}