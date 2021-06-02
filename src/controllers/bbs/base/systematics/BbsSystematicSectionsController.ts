import * as helper from "encrypted-nestjs";

import { IBbsSection } from "../../../../api/structures/bbs/systematics/IBbsSection";

export class BbsSystematicSectionsController
{
    @helper.EncryptedRoute.Get()
    public async index(): Promise<IBbsSection[]>
    {
        return null!;
    }
}