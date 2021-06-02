import * as nest from "@nestjs/common";

import { BbsArticleFreeController } from "../../base/articles/BbsArticleFreeController";

@nest.Controller("bbs/admins/articles/free/:code")
export class BbsAdminArticleFreeController
    extends BbsArticleFreeController
{
}