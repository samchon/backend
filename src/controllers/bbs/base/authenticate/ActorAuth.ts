import express from "express";
import * as nest from "@nestjs/common";
import * as orm from "typeorm";
import safe from "safe-typeorm";
import { IPointer } from "tstl/functional/IPointer";
import { Pair } from "tstl/utility/Pair";

import { TokenManager } from "../../../../utils/TokenManager";

export namespace ActorAuth
{
    export async function authorize<Entity extends safe.Model>
        (
            creator: safe.Model.Creator<Entity>,
            headerKey: string,
            httpReq: express.Request,
            requiresWritable: boolean,
            isWritablePtr?: IPointer<boolean>
        ): Promise<Entity>
    {
        // GET TOKEN VALUE
        const token: string | string[] | undefined = httpReq.headers[headerKey];
        if (token === undefined)
            throw new nest.HttpException("No authorization token exists", 401);

        // PARSE THE TOKEN
        const table: string = orm.getRepository(creator).metadata.tableName;
        const tuple: Pair<string, boolean> | null = TokenManager.parse
        (
            table, 
            token instanceof Array 
                ? token[0] 
                : token
        );

        if (tuple === null)
            throw new nest.ForbiddenException("Your authorization token is not valid.");
        else if (requiresWritable === true && tuple.second === false)
            throw new nest.ForbiddenException("Your authorization token is readonly, but this API requires the writable.");

        // LOAD MATCHED ENTITY RECORD
        const entity: Entity | undefined = await creator.findOne(tuple.first);
        if (entity === undefined)
            throw new nest.ForbiddenException("Your authorization token is valid, however no matched record exists.");
        
        // RETURNS
        if (isWritablePtr !== undefined)
            isWritablePtr.value = tuple.second;
        return entity;
    }

    export function issue<
            Entity extends safe.Model, 
            HeaderKey extends string>
        (
            instance: Entity,
            pkGetter: (entity: Entity) => string,
            headerKey: HeaderKey,
            writable: boolean,
            duration: number = 3 * 60 * 60 * 1000
        ): {
            __set_headers__: { [P in HeaderKey]: string }
        }
    {
        const table: string = orm.getRepository(instance.constructor).metadata.tableName;
        const token: string = TokenManager.generate(table, pkGetter(instance), writable, duration);

        return {
            __set_headers__: { [headerKey]: token } as { [P in HeaderKey]: string }
        };
    }
}