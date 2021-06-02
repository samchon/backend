import express from "express";

import { BbsAdministrator } from "../../../../models/tables/bbs/actors/BbsAdministrator";
import { ActorAuth } from "../../base/authenticate/ActorAuth";

export namespace BbsAdminAuth
{
    export function authorize(request: express.Request): Promise<BbsAdministrator>
    {
        return ActorAuth.authorize(BbsAdministrator, HEADER_KEY, request, true);
    }

    export function issue(instance: BbsAdministrator)
    {
        return ActorAuth.issue(instance, obj => obj.base.id, HEADER_KEY, true);
    }

    const HEADER_KEY = "bbs-admin-authorization";
}