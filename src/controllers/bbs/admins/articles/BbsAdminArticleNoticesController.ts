import * as nest from "@nestjs/common";
import { BbsAdministrator } from "../../../../models/tables/bbs/actors/BbsAdministrator";

import { BbsAdminArticlesTrait } from "./BbsAdminArticlesTrait";
import { BbsArticleNoticesController } from "../../base/articles/BbsArticleNoticesController";

@nest.Controller("bbs/admins/articles/notices/:code")
export class BbsAdminArticleNoticesController
    extends BbsArticleNoticesController<BbsAdministrator, typeof BbsAdminArticlesTrait>
{
    public constructor()
    {
        super(BbsAdminArticlesTrait);
    }
}