import * as helper from "encrypted-nestjs";

import { IBbsSection } from "../../../../api/structures/bbs/systematic/IBbsSection";
import { BbsSectionProvider } from "../../../../providers/bbs/systematic/BbsSectionProvider";

export class BbsSystematicSectionsController
{
    @helper.EncryptedRoute.Get()
    public async index(): Promise<IBbsSection[]>
    {
        return await BbsSectionProvider.index();
    }
}