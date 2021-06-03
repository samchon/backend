import * as nest from "@nestjs/common";
import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";

import { BbsArticleReviewsController } from "../../base/articles/BbsArticleReviewsController";
import { BbsManagerArticlesTrait } from "./BbsManagerArticlesTrait";

@nest.Controller("bbs/managers/articles/reviews/:code")
export class BbsManagerArticleReviewsController
    extends BbsArticleReviewsController<BbsManager, typeof BbsManagerArticlesTrait>
{
    public constructor()
    {
        super(BbsManagerArticlesTrait);
    }
}