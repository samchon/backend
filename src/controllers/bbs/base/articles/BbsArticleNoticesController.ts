import * as helper from "encrypted-nestjs";

import { IBbsNoticeArticle } from "../../../../api/structures/bbs/articles/IBbsNoticeArticle";
import { IPage } from "../../../../api/structures/common/IPage";

export class BbsArticleNoticesController
{
    @helper.EncryptedRoute.Patch()
    public async index
        (
            @helper.TypedParam("code", "string") code: string, 
            @helper.EncryptedBody() input: IBbsNoticeArticle.IRequest
        ): Promise<IPage<IBbsNoticeArticle.ISummary>>
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
        ): Promise<IBbsNoticeArticle>
    {
        code;
        id;

        return null!;
    }
}