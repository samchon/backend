import * as helper from "encrypted-nestjs";
import * as orm from "typeorm";
import { assertType } from "typescript-is";

import { IPage } from "../../../../api/structures/common/IPage";
import { IBbsComment } from "../../../../api/structures/bbs/articles/IBbsComment";
import { IBbsSection } from "../../../../api/structures/bbs/systematic/IBbsSection";

import { BbsArticle } from "../../../../models/tables/bbs/articles/BbsArticle";
import { BbsComment } from "../../../../models/tables/bbs/articles/BbsComment";

import { BbsCommentProvider } from "../../../../providers/bbs/articles/BbsCommentProvider";
import { Paginator } from "../../../../utils/Paginator";
import { BbsSection } from "../../../../models/tables/bbs/systematic/BbsSection";

export class BbsCommentsController
{
    @helper.EncryptedRoute.Patch()
    public async index
        (
            @helper.TypedParam("type", "string") type: string,
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string,
            @helper.EncryptedBody() input: IPage.IRequest
        ): Promise<IPage<IBbsComment>>
    {
        assertType<typeof input>(input);

        const article: BbsArticle = await this._Find_article(type, code, id);
    
        const stmt: orm.SelectQueryBuilder<BbsComment> = BbsCommentProvider.statement(article);
        return await Paginator.paginate(stmt, input, BbsCommentProvider.postProcess);
    }

    protected async _Find_article
        (
            type: string, 
            code: string, 
            id: string
        ): Promise<BbsArticle>
    {
        return BbsArticle
            .createJoinQueryBuilder(article => article.innerJoin("section"))
            .andWhere(...BbsSection.getWhereArguments("type", type as IBbsSection.Type))
            .andWhere(...BbsSection.getWhereArguments("code", code))
            .andWhere(...BbsArticle.getWhereArguments("id", id))
            .getOneOrFail();
    }
}