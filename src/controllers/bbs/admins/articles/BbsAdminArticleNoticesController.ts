import * as nest from "@nestjs/common";

import { BbsArticleNoticesController } from "../../base/articles/BbsArticleNoticesController";

@nest.Controller("bbs/admins/articles/notices/:code")
export class BbsAdminArticleNoticesController
    extends BbsArticleNoticesController
{
}