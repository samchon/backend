import * as nest from "@nestjs/common";

import { BbsArticleFreeController } from "../../base/articles/BbsArticleFreeController";

@nest.Controller("bbs/managers/articles/free/:code")
export class BbsManagerArticleManagerController
    extends BbsArticleFreeController
{
}