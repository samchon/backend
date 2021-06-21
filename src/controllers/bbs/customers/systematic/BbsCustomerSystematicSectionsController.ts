import * as nest from "@nestjs/common";

import { BbsSystematicSectionsController } from "../../base/systematic/BbsSystematicSectionsController";

@nest.Controller("bbs/customers/systematic/sections")
export class BbsCustomerSystematicSectionsController
    extends BbsSystematicSectionsController
{

}