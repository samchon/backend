import * as nest from "@nestjs/common";

import { BbsSystematicSectionsController } from "../../base/systematics/BbsSystematicSectionsController";

@nest.Controller("bbs/managers/systematics/sections")
export class BbsManagerSystematicSectionsController
    extends BbsSystematicSectionsController
{

}