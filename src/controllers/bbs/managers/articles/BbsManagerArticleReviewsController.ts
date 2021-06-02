import * as nest from "@nestjs/common";

import { BbsArticleReviewsController } from "../../base/articles/BbsArticleReviewsController";

@nest.Controller("bbs/managers/articles/reviews/:code")
export class BbsManagerArticleReviewsController
    extends BbsArticleReviewsController
{
}