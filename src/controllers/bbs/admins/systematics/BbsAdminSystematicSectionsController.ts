import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { MutexConnector, RemoteMutex } from "mutex-server";

import { IBbsSection } from "../../../../api/structures/bbs/systematics/IBbsSection";

import { BbsSection } from "../../../../models/tables/bbs/systematics/BbsSection";

import { BbsAdminAuth } from "../authenticate/BbsAdminAuth";
import { BbsSectionProvider } from "../../../../providers/bbs/systematics/BbsSectionProvider";
import { BbsSystematicSectionsController } from "../../base/systematics/BbsSystematicSectionsController";

import { EntityUnifier } from "../../../../utils/EntityUnifier";
import { SGlobal } from "../../../../SGlobal";
import { UniqueLock } from "tstl/thread/UniqueLock";
import { assertType } from "typescript-is";

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
        assertType<typeof input>(input);

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
        assertType<typeof input>(input);

        await BbsAdminAuth.authorize(request);

        const section: BbsSection = await BbsSectionProvider.find(code);
        await BbsSectionProvider.update(section, input);
    }

    @nest.Post("unify")
    public async unify
        (
            @nest.Request() request: express.Request,
            @helper.EncryptedBody() input: IBbsSection.IUnify
        ): Promise<void>
    {
        assertType<typeof input>(input);

        // AUTHORIZE ADMINISTRATOR
        await BbsAdminAuth.authorize(request);

        // FIND TARGET RECORDS
        const keep: BbsSection = await BbsSectionProvider.find(input.keep_code);
        const absorbed: BbsSection[] = await BbsSection
            .createQueryBuilder()
            .andWhere(...BbsSection.getWhereArguments("code", "IN", input.absorbed_codes))
            .getMany();
        if (absorbed.length !== input.absorbed_codes.length)
            throw new nest.NotFoundException("Unable to find the matched record.");

        // EVERY SECTIONS MUST HAVE THE SAME TYPE
        if (absorbed.every(elem => elem.type !== keep.type))
            throw new nest.ConflictException("Every section code must be same.");

        //----
        // UNIFY WITH MUTEX
        //----
        // PREPARE THE SERVER-LEVEL MUTEX
        const critical: MutexConnector<string, null> = await SGlobal.critical.get();
        const mutex: RemoteMutex = await critical.getMutex("bbs_section_unifier");

        // DO UNIFY WITH UNIQUE-LOCK
        await UniqueLock.lock(mutex, () => EntityUnifier.unify(keep, absorbed));
    }
}