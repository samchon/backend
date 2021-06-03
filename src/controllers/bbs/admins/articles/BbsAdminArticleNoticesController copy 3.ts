import * as nest from "@nestjs/common";

import { BbsAdministrator } from "../../../../models/tables/bbs/actors/BbsAdministrator";

import { BbsAdminArticlesTrait } from "./BbsAdminArticlesTrait";
import { BbsArticleFreeController } from "../../base/articles/BbsArticleFreeController";

@nest.Controller("bbs/admins/articles/free/:code")
export class BbsAdminArticleFreeController
    extends BbsArticleFreeController<BbsAdministrator, typeof BbsAdminArticlesTrait>
{
    public constructor()
    {
        super(BbsAdminArticlesTrait);
    }
}