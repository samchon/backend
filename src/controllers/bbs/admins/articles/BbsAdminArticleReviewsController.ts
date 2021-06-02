import * as nest from "@nestjs/common";

import { BbsArticleReviewsController } from "../../base/articles/BbsArticleReviewsController";

@nest.Controller("bbs/admins/articles/reviews/:code")
export class BbsAdminArticleReviewsController
    extends BbsArticleReviewsController
{
}