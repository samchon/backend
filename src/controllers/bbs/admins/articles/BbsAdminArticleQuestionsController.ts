import * as nest from "@nestjs/common";
import { BbsAdministrator } from "../../../../models/tables/bbs/actors/BbsAdministrator";

import { BbsAdminArticlesTrait } from "./BbsAdminArticlesTrait";
import { BbsArticleQuestionsController } from "../../base/articles/BbsArticleQuestionsController";

@nest.Controller("bbs/admins/articles/questions/:code")
export class BbsAdminArticleQuestionsController
    extends BbsArticleQuestionsController<BbsAdministrator, typeof BbsAdminArticlesTrait>
{
    public constructor()
    {
        super(BbsAdminArticlesTrait);
    }
}