import * as express from "express";
import * as nest from "@nestjs/common";

import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";
import { BbsSection } from "../../../../models/tables/bbs/systematics/BbsSection";
import { BbsSectionNomination } from "../../../../models/tables/bbs/systematics/BbsSectionNomination";

import { BbsManagerAuth } from "../authenticate/BbsManagerAuth";

export namespace BbsManagerArticlesTrait
{
    export async function authorize
        (
            request: express.Request, 
            write: boolean,
            section: BbsSection
        ): Promise<BbsManager>
    {
        const manager: BbsManager = await BbsManagerAuth.authorize(request, write);
        const nomination: BbsSectionNomination | undefined = await BbsSectionNomination
            .createQueryBuilder()
            .andWhere(...BbsSectionNomination.getWhereArguments("section", section))
            .andWhere(...BbsSectionNomination.getWhereArguments("manager", manager))
            .getOne();
        if (nomination === undefined)
            throw new nest.ForbiddenException(`You're not manager of the "${section.code}" section.`);

        return manager;
    }
};