import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsFreeArticle } from "../../../../../../api/structures/bbs/articles/IBbsFreeArticle";

import { validate_index } from "../../../../../internal/validate_index";
import { prepare_random_article_content } from "../internal/prepare_random_article_content";
import { test_bbs_article_free_store } from "./test_bbs_article_free_store";

const REPEAT = 4;

export async function test_bbs_article_free_update(connection: api.IConnection): Promise<void>
{
    const [ section, article ] = await test_bbs_article_free_store(connection);
    for (let i: number = 0; i < REPEAT; ++i)
    {
        const content: IBbsFreeArticle.IContent = await api.functional.bbs.customers.articles.free.update
        (
            connection,
            section.code,
            article.id,
            prepare_random_article_content()
        );
        assertType<typeof content>(content);
        article.contents.push(content);
    }

    const reloaded: IBbsFreeArticle = await api.functional.bbs.customers.articles.free.at
    (
        connection,
        section.code,
        article.id
    );
    assertType<typeof reloaded>(reloaded);
    validate_index("BbsFreeArticleProvider.update()", article.contents, reloaded.contents);
}