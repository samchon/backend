import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsComment } from "../../../../../../api/structures/bbs/articles/IBbsComment";
import { IPage } from "../../../../../../api/structures/common/IPage";

import { test_bbs_article_free_store } from "../free/test_bbs_article_free_store";
import { prepare_random_article_content } from "../internal/prepare_random_article_content";

export async function test_bbs_comment_store(connection: api.IConnection)
{
    const [ section, article ] = await test_bbs_article_free_store(connection);

    const page: IPage<IBbsComment> = await api.functional.bbs.customers.articles.comments.index
    (
        connection,
        section.type,
        section.code,
        article.id,
        {}
    );
    assertType<typeof page>(page);

    const comment: IBbsComment = await api.functional.bbs.customers.articles.comments.store
    (
        connection,
        section.type,
        section.code,
        article.id,
        prepare_random_article_content()
    );
    assertType<typeof comment>(comment);
}