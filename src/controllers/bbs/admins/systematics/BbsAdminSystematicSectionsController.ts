import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";

import { IBbsSection } from "../../../../api/structures/bbs/systematics/IBbsSection";

import { BbsSection } from "../../../../models/tables/bbs/systematics/BbsSection";

import { BbsAdminAuth } from "../authenticate/BbsAdminAuth";
import { BbsSectionProvider } from "../../../../providers/bbs/systematics/BbsSectionProvider";
import { BbsSystematicSectionsController } from "../../base/systematics/BbsSystematicSectionsController";

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
        await BbsAdminAuth.authorize(request);

        const section: BbsSection = await BbsSectionProvider.store(input);
        return {
            ...section.toPrimitive(),
            managers: []
        };
    }

    @nest.Put(":code")
    public async update
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsSection.IUpdate
        ): Promise<void>
    {
        await BbsAdminAuth.authorize(request);

        const section: BbsSection = await BbsSectionProvider.find(code);
        await BbsSectionProvider.update(section, input);
    }
}