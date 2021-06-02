import * as nest from "@nestjs/common";

import { BbsArticleQuestionsController } from "../../base/articles/BbsArticleQuestionsController";

@nest.Controller("bbs/admins/articles/questions/:code")
export class BbsAdminArticleQuestionsController
    extends BbsArticleQuestionsController
{
}