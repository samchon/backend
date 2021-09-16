import * as nest from "@nestjs/common";
import * as orm from "typeorm";
import safe from "safe-typeorm";
import { sort } from "tstl/ranges/algorithm/sorting";

import { AesPkcs5 } from "../../../api/__internal/AesPkcs5";
import { IBbsComment } from "../../../api/structures/bbs/articles/IBbsComment";

import { BbsArticle } from "../../../models/tables/bbs/articles/BbsArticle";
import { BbsComment } from "../../../models/tables/bbs/articles/BbsComment";
import { BbsCommentFile } from "../../../models/tables/bbs/articles/BbsCommentFile";
import { BbsCustomer } from "../../../models/tables/bbs/actors/BbsCustomer";
import { BbsManager } from "../../../models/tables/bbs/actors/BbsManager";
import { BbsSectionNomination } from "../../../models/tables/bbs/systematic/BbsSectionNomination";
import { Citizen } from "../../../models/tables/members/Citizen";

import { AttachmentFileProvider } from "../../misc/AttachmentFileProvider";
import { ArrayUtil } from "../../../utils/ArrayUtil";

export namespace BbsCommentProvider
{
    /* ----------------------------------------------------------------
        INDEX
    ---------------------------------------------------------------- */
    export function statement
        (
            article: safe.typings.ModelLike<BbsArticle, "uuid", false>
        ): orm.SelectQueryBuilder<BbsComment>
    {
        return BbsComment
            .createJoinQueryBuilder(comment =>
            {
                comment.leftJoin("customer")
                    .leftJoin("citizen", "CCTZ");
                comment.leftJoin("manager")
                    .leftJoin("base")
                    .leftJoin("citizen", "MCTZ");
            })
            .andWhere(...BbsComment.getWhereArguments("article", article))
            .select([
                BbsComment.getColumn("id"),
                `IF(${BbsCustomer.getColumn("id", null)} IS NULL, 'MANAGER', 'CUSTOMER') AS writer_type`,
                `IF(${BbsCustomer.getColumn("id", null)} IS NULL, MCTZ.name, CCTZ.name) AS writer_name`,
                BbsComment.getColumn("body"),
                BbsComment.getColumn("created_at")
            ])
            .orderBy(BbsComment.getColumn("created_at", null), "DESC");
    }

    export async function postProcess(comments: IBbsComment[]): Promise<IBbsComment[]>
    {
        const dict: Map<string, BbsCommentFile[]> = new Map();
        for (const elem of comments)
        {
            elem.writer_name = AesPkcs5.decode
            (
                elem.writer_name, 
                Citizen.ENCRYPTION_PASSWORD.key, 
                Citizen.ENCRYPTION_PASSWORD.iv
            );
            dict.set(elem.id, []);
        }

        const routerList: BbsCommentFile[] = await BbsCommentFile
            .createJoinQueryBuilder(router => router.innerJoinAndSelect("file"))
            .andWhere(...BbsCommentFile.getWhereArguments("comment", "IN", comments.map(c => c.id)))
            .getMany();
        for (const router of routerList)
        {
            let array: BbsCommentFile[] | undefined = dict.get(router.comment.id);
            if (array === undefined)
            {
                array = [];
                dict.set(router.comment.id, array);
            }
            array.push(router);
        }

        for (const elem of comments)
        {
            const array: BbsCommentFile[] = dict.get(elem.id)!;
            sort(array, (x, y) => x.sequence < y.sequence);

            elem.files = await ArrayUtil.asyncMap(array, router => router.file.get());
        }
        return comments;
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    export async function json(comment: BbsComment): Promise<IBbsComment>
    {
        const stmt: orm.SelectQueryBuilder<BbsComment> = statement(comment.article);
        stmt.andWhere(...BbsComment.getWhereArguments("id", comment.id));
        
        const record: IBbsComment = (await stmt.getRawOne())!;
        return (await postProcess([record]))[0];
    }

    /* ----------------------------------------------------------------
        STORE
    ---------------------------------------------------------------- */
    export async function store
        (
            article: BbsArticle,
            actor: BbsCustomer<true> | BbsManager,
            input: IBbsComment.IStore
        ): Promise<BbsComment>
    {
        const collection: safe.InsertCollection = new safe.InsertCollection();
        const comment: BbsComment = await collect(collection, article, actor, input);

        await collection.execute();
        return comment;
    }

    export async function collect
        (
            collection: safe.InsertCollection,
            article: BbsArticle,
            actor: BbsCustomer<true> | BbsManager,
            input: IBbsComment.IStore
        ): Promise<BbsComment>
    {
        if (actor instanceof BbsManager)
        {
            const nomination: BbsSectionNomination | undefined = await BbsSectionNomination
                .createQueryBuilder()
                .andWhere(...BbsSectionNomination.getWhereArguments("section", article.section))
                .andWhere(...BbsSectionNomination.getWhereArguments("manager", actor))
                .getOne();
            if (nomination === undefined)
                throw new nest.ForbiddenException("You're not manager of that section.")
        }

        const comment: BbsComment = BbsComment.initialize({
            id: safe.DEFAULT,
            article,
            customer: actor instanceof BbsCustomer ? actor : null,
            manager: actor instanceof BbsManager ? actor : null,
            body: input.body,
            created_at: safe.DEFAULT
        });

        AttachmentFileProvider.collectList(collection, input.files, 
            (file, sequence) => BbsCommentFile.initialize({
                id: safe.DEFAULT,
                comment,
                file,
                sequence
            }));

        return collection.push(comment);
    }
}