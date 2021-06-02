import * as nest from "@nestjs/common";

import { BbsSystematicSectionsController } from "../../base/systematics/BbsSystematicSectionsController";

@nest.Controller("bbs/customers/systematics/sections")
export class BbsCustomerSystematicSectionsController
    extends BbsSystematicSectionsController
{

}