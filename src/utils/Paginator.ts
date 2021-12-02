import * as orm from "typeorm";
import { HashMap } from "tstl/container/HashMap";

import { Atomic } from "../api/typings/Atomic";
import { IEntity } from "../api/structures/common/IEntity";
import { IPage } from "../api/structures/common/IPage";

/**
 * Pagination 유틸리티 클래스
 * 
 * @author Samchon
 */
export namespace Paginator
{
    export type PostProcess<
            Input extends object, 
            Output extends object> 
        = (records: Input[]) => (Output[] | Promise<Output[]>);

    export function regular<Input extends object, Output extends object>
        (
            stmt: orm.SelectQueryBuilder<Input>,
            request: IPage.IRequest,
            postProcess: PostProcess<Input, Output>
        ): Promise<IPage<Output>>
    {
        return _Paginate(stmt, request, postProcess, stmt => stmt.getMany());
    }

    export function raw<Input extends object, Output extends object>
        (
            stmt: orm.SelectQueryBuilder<Input>, 
            request: IPage.IRequest,
            postProcess?: PostProcess<any | Atomic<Output>, Output>
        ): Promise<IPage<Output>>
    {
        return _Paginate(stmt, request, postProcess, stmt => stmt.getRawMany());
    }

    export function stream<Raw extends IEntity, Regular extends IEntity>
        (
            input: Raw[], 
            output: Regular[], 
            getter: (elem: Regular) => string = elem => elem.id
        ): void
    {
        const dict: HashMap<string, Regular> = new HashMap();
        for (const o of output)
            dict.emplace(getter(o), o);
        
        input.forEach((item, index) =>
        {
            output[index] = dict.get(item.id);
        });
    }

    async function _Paginate
        (
            stmt: orm.SelectQueryBuilder<any>, 
            request: IPage.IRequest, 
            postProcess: PostProcess<any, any> | undefined,
            accessor: (stmt: orm.SelectQueryBuilder<any>) => Promise<any[]>,
        ): Promise<IPage<any>>
    {
        // NORMALIZE INPUT
        request.limit = request.limit !== undefined ? Number(request.limit) : LIMIT;

        const total_count: number = await stmt.getCount();
        const total_pages: number = request.limit !== 0 
            ? Math.ceil(total_count / request.limit)
            : 0;

        request.page = request.page !== undefined 
            ? Math.max(1, Math.min(Number(request.page) , total_pages))
            : 1;

        // GET DATA
        const index: orm.SelectQueryBuilder<any> = stmt.clone()
            .offset(request.limit * Math.max(request.page - 1, 0))
            .limit(request.limit);
        
        // GET DATA WITH POST-PROCESSING    
        let data: any[] = await accessor(index);
        if (postProcess && data.length !== 0)
            data = await postProcess(data);

        // RETURNS
        return {
            pagination: {
                page: request.page,
                limit: request.limit,
                total_count,
                total_pages
            },
            data: data
        };
    }

    /**
     * @hidden
     */
    export function sort
        (
            stmt: orm.SelectQueryBuilder<any>, 
            fieldList: string[],
            dictionary?: Map<string, string>
        ): void
    {
        // SPECIALIZATION
        let direction: "ASC" | "DESC";
        fieldList.forEach((field, index) =>
        {
            // PARAMETERS
            if (field[0] === "+")
            {
                direction = "ASC";
                field = field.substr(1);
            }
            else if (field[0] === "-")
            {
                direction = "DESC";
                field = field.substr(1);
            }
            else
                direction = "ASC";
        
            // DICTIONARY MAPPING
            if (dictionary)
            {
                const found = dictionary.get(field);
                if (found)
                    field = found;
            }

            // DO ORDER
            if (index === 0)
                stmt.orderBy(field, direction);
            else
                stmt.addOrderBy(field, direction);
        });
    }
}

const LIMIT = 100;