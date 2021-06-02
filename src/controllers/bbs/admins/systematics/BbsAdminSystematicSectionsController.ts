import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { BbsSystematicSectionsController } from "../../base/systematics/BbsSystematicSectionsController";
import { IBbsSection } from "../../../../api/structures/bbs/systematics/IBbsSection";

@nest.Controller("bbs/admins/systematics/sections")
export class BbsAdminSystematicSectionsController
    extends BbsSystematicSectionsController
{
    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsSection.IStore
        ): Promise<IBbsSection>
    {
        request;
        input;

        return null!;
    }

    @nest.Put(":code")
    public async update
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsSection.IUpdate
        ): Promise<void>
    {
        request;
        code;
        input;
    }
}