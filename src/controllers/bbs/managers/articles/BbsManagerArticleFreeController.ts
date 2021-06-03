import * as nest from "@nestjs/common";
import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";

import { BbsArticleFreeController } from "../../base/articles/BbsArticleFreeController";
import { BbsManagerArticlesTrait } from "./BbsManagerArticlesTrait";

@nest.Controller("bbs/managers/articles/free/:code")
export class BbsManagerArticleManagerController
    extends BbsArticleFreeController<BbsManager, typeof BbsManagerArticlesTrait>
{
    public constructor()
    {
        super(BbsManagerArticlesTrait);
    }
}