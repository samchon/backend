import express from "express";
import { IPointer } from "tstl/functional/IPointer";

import { BbsManager } from "../../../../models/tables/bbs/actors/BbsManager";
import { ActorAuth } from "../../base/authenticate/ActorAuth";

export namespace BbsManagerAuth
{
    export function authorize
        (
            request: express.Request,
            requiresWritable: boolean,
            isWritablePtr?: IPointer<boolean>
        ): Promise<BbsManager>
    {
        return ActorAuth.authorize
        (
            BbsManager, 
            HEADER_KEY, 
            request, 
            requiresWritable, 
            isWritablePtr
        );
    }

    export function issue(instance: BbsManager, writable: boolean)
    {
        return ActorAuth.issue
        (
            instance, 
            elem => elem.base.id, 
            HEADER_KEY, 
            writable
        );
    }

    const HEADER_KEY = "bbs-manager-authorization";
}