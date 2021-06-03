import * as nest from "@nestjs/common";
import { BbsCustomer } from "../../../../models/tables/bbs/actors/BbsCustomer";

import { BbsArticleNoticesController } from "../../base/articles/BbsArticleNoticesController";
import { BbsCustomerArticlesTrait } from "./BbsCustomerArticlesTrait";

@nest.Controller("bbs/customers/articles/notices/:code")
export class BbsCustomerArticleNoticesController
    extends BbsArticleNoticesController<BbsCustomer, typeof BbsCustomerArticlesTrait>
{
    public constructor()
    {
        super(BbsCustomerArticlesTrait);
    }
}