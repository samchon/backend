import * as nest from "@nestjs/common";
import { BbsAdministrator } from "../../../../models/tables/bbs/actors/BbsAdministrator";

import { BbsAdminArticlesTrait } from "./BbsAdminArticlesTrait";
import { BbsArticleReviewsController } from "../../base/articles/BbsArticleReviewsController";

@nest.Controller("bbs/admins/articles/reviews/:code")
export class BbsAdminArticleReviewsController
    extends BbsArticleReviewsController<BbsAdministrator, typeof BbsAdminArticlesTrait>
{
    public constructor()
    {
        super(BbsAdminArticlesTrait);
    }
}