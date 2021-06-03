import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { assertType } from "typescript-is";

import { IBbsNoticeArticle } from "../../../../api/structures/bbs/articles/IBbsNoticeArticle";

import { BbsArticle } from "../../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";
import { BbsSection } from "../../../../models/tables/bbs/systematics/BbsSection";
import { BbsNoticeArticle } from "../../../../models/tables/bbs/articles/BbsNoticeArticle";

import { BbsArticleContentProvider } from "../../../../providers/bbs/articles/BbsArticleContentProvider";
import { BbsArticleNoticesController } from "../../base/articles/BbsArticleNoticesController";
import { BbsManagerArticlesTrait } from "./BbsManagerArticlesTrait";
import { BbsNoticeArticleProvider } from "../../../../providers/bbs/articles/BbsNoticeArticleController";
import { BbsSectionProvider } from "../../../../providers/bbs/systematics/BbsSectionProvider";

@nest.Controller("bbs/managers/articles/notices/:code")
export class BbsManagerArticleNoticesController
    extends BbsArticleNoticesController<BbsManager, typeof BbsManagerArticlesTrait>
{
    public constructor()
    {
        super(BbsManagerArticlesTrait);
    }

    @helper.EncryptedRoute.Post()
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.EncryptedBody() input: IBbsNoticeArticle.IStore
        ): Promise<IBbsNoticeArticle>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "NOTICE");
        const manager: BbsManager = await this.trait.authorize(request, true, section);

        const notice: BbsNoticeArticle = await BbsNoticeArticleProvider.store
        (
            section,
            manager,
            input
        );
        return await BbsNoticeArticleProvider.json(notice);
    }

    @helper.EncryptedRoute.Put(":id")
    public async update
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string,
            @helper.EncryptedBody() input: IBbsNoticeArticle.IUpdate
        ): Promise<IBbsNoticeArticle.IContent>
    {
        assertType<typeof input>(input);

        const section: BbsSection = await BbsSectionProvider.find(code, "NOTICE");
        const manager: BbsManager = await this.trait.authorize(request, true, section);

        const notice: BbsNoticeArticle = await BbsNoticeArticleProvider.editable
        (
            section, 
            id, 
            manager
        );
        const article: BbsArticle = await notice.base.get();
        const content: BbsArticleContent = await BbsArticleContentProvider.update(article, input);

        return await BbsArticleContentProvider.json(content);
    }
}