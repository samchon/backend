import * as nest from "@nestjs/common";
import * as orm from "typeorm";
import safe from "safe-typeorm";

import { IBbsFreeArticle } from "../../../api/structures/bbs/articles/IBbsFreeArticle";

import { BbsCustomer } from "../../../models/tables/bbs/actors/BbsCustomer";
import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsArticleContent } from "../../../models/tables/bbs/articles/BbsArticleContent";
import { BbsFreeArticle } from "../../../models/tables/bbs/articles/BbsFreeArticle";
import { BbsSection } from "../../../models/tables/bbs/systematic/BbsSection";
import { Citizen } from "../../../models/tables/members/Citizen";
import { __MvBbsArticleHit } from "../../../models/material/bbs/__MvBbsArticleHit";

import { BbsArticleProvider } from "./BbsArticleProvider";
import { BbsArticleContentProvider } from "./BbsArticleContentProvider";
import { BbsCustomerProvider } from "../actors/BbsCustomerProvider";
import { Singleton } from "tstl/thread/Singleton";

export namespace BbsFreeArticleProvider
{
    /* ----------------------------------------------------------------
        INDEX
    ---------------------------------------------------------------- */
    export function statement
        (
            section: BbsSection,
            input: IBbsFreeArticle.IRequest.ISearch | null
        ): orm.SelectQueryBuilder<BbsFreeArticle>
    {
        const stmt: orm.SelectQueryBuilder<BbsFreeArticle> = BbsFreeArticle
            .createJoinQueryBuilder(free =>
            {
                free.innerJoin("customer")
                    .innerJoin("citizen");
                free.innerJoin("base", article =>
                {
                    article.innerJoin("__mv_hit");
                    article.innerJoin("__mv_last")
                        .innerJoin("content");
                });
            })
            .andWhere(...BbsArticle.getWhereArguments("section", "=", section))
            .select([
                BbsArticle.getColumn("id"),
                Citizen.getColumn("name", "customer"),
                BbsArticleContent.getColumn("title"),
                __MvBbsArticleHit.getColumn("count", "hit"),
                BbsArticle.getColumn("created_at"),
                BbsArticleContent.getColumn("created_at", "updated_at")
            ])
            .orderBy(BbsArticle.getColumn("created_at", null), "DESC");

        if (input !== null)
            BbsArticleProvider.search(stmt, input);
        
        return stmt;
    }

    export function postProcess(summaries: IBbsFreeArticle.ISummary[]): IBbsFreeArticle.ISummary[]
    {
        for (const summary of summaries)
            summary.customer = safe.AesPkcs5.decode
            (
                summary.customer,
                Citizen.ENCRYPTION_PASSWORD.key,
                Citizen.ENCRYPTION_PASSWORD.iv
            );
        return summaries;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export async function find(section: BbsSection, id: string): Promise<BbsFreeArticle>
    {
        return await BbsFreeArticle
            .createJoinQueryBuilder(free => 
            {
                free.innerJoinAndSelect("customer")
                    .innerJoinAndSelect("citizen");
                free.innerJoinAndSelect("base")
                    .leftJoinAndSelect("__mv_hit");
            })
            .andWhere(...BbsArticle.getWhereArguments("section", "=", section))
            .andWhere(...BbsArticle.getWhereArguments("id", "=", id))
            .getOneOrFail();
    }

    export async function editable
        (
            section: BbsSection, 
            id: string,
            customer: BbsCustomer<true>,
        ): Promise<BbsFreeArticle>
    {
        // GET ARTICLE
        const free: BbsFreeArticle = await find(section, id);

        // VALIDATE OWNERSHIP
        const writer: Citizen = await (await free.customer.get()).citizen.get();
        const accessor: Citizen = await customer.citizen.get();

        if (writer.id !== accessor.id)
            throw new nest.ForbiddenException("This article is not yours.");

        return free;
    }

    export function json(): safe.JsonSelectBuilder<BbsFreeArticle, any, IBbsFreeArticle>
    {
        return json_builder.get();
    }

    const json_builder = new Singleton(() => safe.createJsonSelectBuilder
    (
        BbsFreeArticle,
        {
            base: BbsArticleProvider.json(),
            customer: BbsCustomerProvider.json(),
        },
        output => ({
            ...output,
            ...output.base,
            base: undefined
        })
    ));

    /* ----------------------------------------------------------------
        SAVE
    ---------------------------------------------------------------- */
    export async function collect
        (
            collection: safe.InsertCollection,
            section: BbsSection, 
            customer: BbsCustomer<true>,
            input: IBbsFreeArticle.IStore
        ): Promise<BbsFreeArticle>
    {
        // SUPER-TYPE
        const base: BbsArticle = await BbsArticleProvider.collect
        (
            collection,
            section,
            input,
            BbsArticleContentProvider.collect,
            true
        );

        // SUB-TYPE
        const free: BbsFreeArticle = BbsFreeArticle.initialize({
            base,
            customer
        });
        await base.free.set(collection.push(free));

        return free;
    }

    export async function store
        (
            section: BbsSection, 
            customer: BbsCustomer<true>,
            input: IBbsFreeArticle.IStore
        ): Promise<BbsFreeArticle>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const free: BbsFreeArticle = await collect(collection, section, customer, input);
        
        await collection.execute();
        return free;
    }
}