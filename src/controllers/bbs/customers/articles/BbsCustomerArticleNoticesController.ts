import * as nest from "@nestjs/common";

import { BbsArticleNoticesController } from "../../base/articles/BbsArticleNoticesController";

@nest.Controller("bbs/customers/articles/notices/:code")
export class BbsCustomerArticleNoticesController
    extends BbsArticleNoticesController
{
}