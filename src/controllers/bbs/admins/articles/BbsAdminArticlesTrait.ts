import * as express from "express";

import { BbsAdministrator } from "../../../../models/tables/bbs/actors/BbsAdministrator";

import { BbsAdminAuth } from "../authenticate/BbsAdminAuth";

export namespace BbsAdminArticlesTrait
{
    export function authorize(request: express.Request): Promise<BbsAdministrator>
    {
        return BbsAdminAuth.authorize(request);
    }
}