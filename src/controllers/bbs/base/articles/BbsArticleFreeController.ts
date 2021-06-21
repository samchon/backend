import * as express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { assertType } from "typescript-is";

import { IBbsFreeArticle } from "../../../../api/structures/bbs/articles/IBbsFreeArticle";
import { IPage } from "../../../../api/structures/common/IPage";

import { BbsFreeArticle } from "../../../../models/tables/bbs/articles/BbsFreeArticle";
import { BbsSection } from "../../../../models/tables/bbs/systematic/BbsSection";

import { IBbsArticlesTrait } from "./IBbsArticlesTrait";
import { BbsFreeArticleProvider } from "../../../../providers/bbs/articles/BbsFreeArticleProvider";
import { BbsSectionProvider } from "../../../../providers/bbs/systematic/BbsSectionProvider";
import { Paginator } from "../../../../utils/Paginator";

export abstract class BbsArticleFreeController<
        Actor extends safe.Model, 
        Trait extends IBbsArticlesTrait<Actor>>
{
    protected constructor(protected readonly trait: Trait)
    {
    }

    @helper.EncryptedRoute.Patch()
    public async index
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string, 
            @helper.EncryptedBody() input: IBbsFreeArticle.IRequest
        ): Promise<IPage<IBbsFreeArticle.ISummary>>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "free");
        await this.trait.authorize(request, false, section);

        const stmt = BbsFreeArticleProvider.statement(section, input.search);
        return await Paginator.paginate(stmt, input, BbsFreeArticleProvider.postProcess);
    }

    @helper.EncryptedRoute.Get(":id")
    public async at
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string
        ): Promise<IBbsFreeArticle>
    {
        const section: BbsSection = await BbsSectionProvider.find(code, "free");
        await this.trait.authorize(request, false, section);

        const free: BbsFreeArticle = await BbsFreeArticleProvider.find(section, id);
        return await BbsFreeArticleProvider.json(free);
    }
}