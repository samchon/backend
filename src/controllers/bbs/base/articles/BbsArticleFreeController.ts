import * as helper from "encrypted-nestjs";

import { IBbsFreeArticle } from "../../../../api/structures/bbs/articles/IBbsFreeArticle";
import { IPage } from "../../../../api/structures/common/IPage";

export class BbsArticleFreeController
{
    @helper.EncryptedRoute.Patch()
    public async index
        (
            @helper.TypedParam("code", "string") code: string, 
            @helper.EncryptedBody() input: IBbsFreeArticle.IRequest
        ): Promise<IPage<IBbsFreeArticle.ISummary>>
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
        ): Promise<IBbsFreeArticle>
    {
        code;
        id;

        return null!;
    }
}