import * as helper from "encrypted-nestjs";

import { IBbsSection } from "../../../../api/structures/bbs/systematics/IBbsSection";
import { BbsSectionProvider } from "../../../../providers/bbs/systematics/BbsSectionProvider";

export class BbsSystematicSectionsController
{
    @helper.EncryptedRoute.Get()
    public async index(): Promise<IBbsSection[]>
    {
        return await BbsSectionProvider.index();
    }
}