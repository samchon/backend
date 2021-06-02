import * as helper from "encrypted-nestjs";

import { IBbsReviewArticle } from "../../../../api/structures/bbs/articles/IBbsReviewArticle";
import { IPage } from "../../../../api/structures/common/IPage";

export class BbsArticleReviewsController
{
    @helper.EncryptedRoute.Patch()
    public async index
        (
            @helper.TypedParam("code", "string") code: string, 
            @helper.EncryptedBody() input: IBbsReviewArticle.IRequest
        ): Promise<IPage<IBbsReviewArticle.ISummary>>
    {
        code;
        input;

        return null!;
    }

    @helper.EncryptedRoute.Get(":id")
    public async at
        (
            @helper.TypedParam("code", "string") code: string,
            @helper.TypedParam("id", "string") id: string
        ): Promise<IBbsReviewArticle>
    {
        code;
        id;

        return null!;
    }
}