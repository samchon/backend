import express from "express";
import * as helper from "encrypted-nestjs";
import * as nest from "@nestjs/common";
import { IBbsSection } from "../../../../api/structures/bbs/systematics/IBbsSection";

@nest.Controller("bbs/admins/systematics/sections/:code/nominations")
export class BbsAdminSystematicSectionNominationsController
{
    @nest.Get(":memberId")
    public async store
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("memberId", "string") memberId: string
        ): Promise<IBbsSection.INominatedManager>
    {
        request;
        code;
        memberId;

        return null!;
    }

    @nest.Delete(":memberId")
    public async erase
        (
            @nest.Request() request: express.Request,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("memberId", "string") memberId: string
        ): Promise<void>
    {
        request;
        code;
        memberId;
    }
}