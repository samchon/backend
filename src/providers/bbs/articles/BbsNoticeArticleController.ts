import * as nest from "@nestjs/common";
import * as orm from "typeorm";
import safe from "safe-typeorm";

import { IBbsNoticeArticle } from "../../../api/structures/bbs/articles/IBbsNoticeArticle";

import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsNoticeArticle } from "../../../models/tables/bbs/articles/BbsNoticeArticle";
import { BbsSection } from "../../../models/tables/bbs/systematics/BbsSection";
import { Citizen } from "../../../models/tables/members/Citizen";
import { __MvBbsArticleHit } from "../../../models/material/bbs/__MvBbsArticleHit";

import { BbsArticleProvider } from "./BbsArticleProvider";
import { BbsArticleContentProvider } from "./BbsArticleContentProvider";
import { MemberProvider } from "../../members/MemberProvider";

export namespace BbsNoticeArticleProvider
{
    /* ----------------------------------------------------------------
        INDEX
    ---------------------------------------------------------------- */
    export function statement
        (
            section: BbsSection,
            input: IBbsNoticeArticle.IRequest.ISearch | null
        ): orm.SelectQueryBuilder<BbsNoticeArticle>
    {
        const stmt: orm.SelectQueryBuilder<BbsNoticeArticle> = BbsNoticeArticle
            .createJoinQueryBuilder(notice =>
            {
                notice.innerJoin("manager")
                    .innerJoin("base")
                    .innerJoin("citizen");
                notice.innerJoin("base", article =>
                {
                    article.innerJoin("__mv_hit");
                    article.innerJoin("__mv_last")
                        .innerJoin("content");
                });
            })
            .andWhere(...BbsArticle.getWhereArguments("section", "=", section))
            .select([
                BbsArticle.getColumn("id"),
                Citizen.getColumn("name", "manager"),
                BbsArticle.getColumn("created_at"),
                BbsArticleContent.getColumn("created_at", "updated_at")
            ])
            .orderBy(BbsArticle.getColumn("created_at", null), "DESC");

        if (input !== null)
            BbsArticleProvider.search(stmt, input);
        
        return stmt;
    }

    export function postProcess(summaries: IBbsNoticeArticle.ISummary[]): IBbsNoticeArticle.ISummary[]
    {
        for (const summary of summaries)
            summary.manager = safe.AesPkcs5.decode
            (
                summary.manager,
                Citizen.ENCRYPTION_PASSWORD.key,
                Citizen.ENCRYPTION_PASSWORD.iv
            );
        return summaries;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export async function find(section: BbsSection, id: string): Promise<BbsNoticeArticle>
    {
        return await BbsNoticeArticle
            .createJoinQueryBuilder(notice => 
            {
                notice.innerJoinAndSelect("manager")
                    .innerJoinAndSelect("base")
                    .innerJoin("citizen");
                notice.innerJoinAndSelect("base");
            })
            .andWhere(...BbsArticle.getWhereArguments("section", "=", section))
            .andWhere(...BbsArticle.getWhereArguments("id", "=", id))
            .getOneOrFail();
    }

    export async function editable
        (
            section: BbsSection, 
            id: string,
            manager: BbsManager
        ): Promise<BbsNoticeArticle>
    {
        // GET ARTICLE
        const notice: BbsNoticeArticle = await find(section, id);

        // VALIDATE OWNERSHIP
        if (notice.manager.id !== manager.base.id)
            throw new nest.ForbiddenException("This article is not yours.");

        return notice;
    }

    export async function json(notice: BbsNoticeArticle): Promise<IBbsNoticeArticle>
    {
        const base: BbsArticle = await notice.base.get();
        const manager: BbsManager = await notice.manager.get();
        const hit: __MvBbsArticleHit | null = await base.__mv_hit.get();

        return {
            ...await BbsArticleProvider.json(base, BbsArticleContentProvider.json),
            manager: await MemberProvider.json(await manager.base.get()),
            hit: (hit !== null)
                ? hit.count 
                : 0
        };
    }

    /* ----------------------------------------------------------------
        SAVE
    ---------------------------------------------------------------- */
    export function collect
        (
            collection: safe.InsertCollection,
            section: BbsSection, 
            manager: BbsManager,
            input: IBbsNoticeArticle.IStore
        ): BbsNoticeArticle
    {
        // SUPER-TYPE
        const base: BbsArticle = BbsArticleProvider.collect
        (
            collection,
            section,
            input,
            BbsArticleContentProvider.collect,
            true
        );

        // SUB-TYPE
        const notice: BbsNoticeArticle = BbsNoticeArticle.initialize({
            base,
            manager
        });
        base.notice.set(collection.push(notice));

        return notice;
    }

    export async function store
        (
            section: BbsSection, 
            manager: BbsManager,
            input: IBbsNoticeArticle.IStore
        ): Promise<BbsNoticeArticle>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const notice: BbsNoticeArticle = collect(collection, section, manager, input);
        
        await collection.execute();
        return notice;
    }
}