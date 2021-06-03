import * as express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import safe from "safe-typeorm";
import { assertType } from "typescript-is";

import { IBbsNoticeArticle } from "../../../../api/structures/bbs/articles/IBbsNoticeArticle";
import { IPage } from "../../../../api/structures/common/IPage";

import { BbsNoticeArticle } from "../../../../models/tables/bbs/articles/BbsNoticeArticle";
import { BbsSection } from "../../../../models/tables/bbs/systematics/BbsSection";

import { IBbsArticlesTrait } from "./IBbsArticlesTrait";
import { BbsNoticeArticleProvider } from "../../../../providers/bbs/articles/BbsNoticeArticleController";
import { BbsSectionProvider } from "../../../../providers/bbs/systematics/BbsSectionProvider";
import { Paginator } from "../../../../utils/Paginator";

export abstract class BbsArticleNoticesController<
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
            @helper.EncryptedBody() input: IBbsNoticeArticle.IRequest
        ): Promise<IPage<IBbsNoticeArticle.ISummary>>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "NOTICE");
        await this.trait.authorize(request, false, section);

        const stmt = BbsNoticeArticleProvider.statement(section, input.search);
        return await Paginator.paginate(stmt, input, BbsNoticeArticleProvider.postProcess);
    }

    @helper.EncryptedRoute.Get(":id")
    public async at
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string
        ): Promise<IBbsNoticeArticle>
    {
        const section: BbsSection = await BbsSectionProvider.find(code, "NOTICE");
        await this.trait.authorize(request, false, section);

        const notice: BbsNoticeArticle = await BbsNoticeArticleProvider.find(section, id);
        return await BbsNoticeArticleProvider.json(notice);
    }
}