import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsNoticeArticle } from "../../../../../../api/structures/bbs/articles/IBbsNoticeArticle";

import { validate_index } from "../../../../../internal/validate_index";
import { prepare_random_article_content } from "../internal/prepare_random_article_content";
import { test_bbs_article_notice_store } from "./test_bbs_article_notice_store";

const REPEAT = 4;

export async function test_bbs_article_notice_update(connection: api.IConnection): Promise<void>
{
    const [ section, article ] = await test_bbs_article_notice_store(connection);
    for (let i: number = 0; i < REPEAT; ++i)
    {
        const content: IBbsNoticeArticle.IContent = await api.functional.bbs.managers.articles.notices.update
        (
            connection,
            section.code,
            article.id,
            prepare_random_article_content()
        );
        assertType<typeof content>(content);
        article.contents.push(content);
    }

    const reloaded: IBbsNoticeArticle = await api.functional.bbs.managers.articles.notices.at
    (
        connection,
        section.code,
        article.id
    );
    assertType<typeof reloaded>(reloaded);
    validate_index("BbsNoticeArticleProvider.update()", article.contents, reloaded.contents);
}