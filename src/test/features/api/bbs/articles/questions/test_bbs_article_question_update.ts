import { assertType } from "typescript-is";
import api from "../../../../../../api";

import { IBbsQuestionArticle } from "../../../../../../api/structures/bbs/articles/IBbsQuestionArticle";

import { validate_index } from "../../../../../internal/validate_index";
import { prepare_random_article_content } from "../internal/prepare_random_article_content";
import { test_bbs_article_answer_store } from "./test_bbs_article_answer_store";
import { test_bbs_article_question_store } from "./test_bbs_article_question_store";

const REPEAT = 4;

export async function test_bbs_article_question_update(connection: api.IConnection): Promise<void>
{
    const [ section, article ] = Math.random() < .5
        ? await test_bbs_article_question_store(connection)
        : await test_bbs_article_answer_store(connection);

    for (let i: number = 0; i < REPEAT; ++i)
    {
        const content: IBbsQuestionArticle.IContent = await api.functional.bbs.customers.articles.questions.update
        (
            connection,
            section.code,
            article.id,
            prepare_random_article_content()
        );
        assertType<typeof content>(content);
        article.contents.push(content);
    }

    const reloaded: IBbsQuestionArticle = await api.functional.bbs.customers.articles.questions.at
    (
        connection,
        section.code,
        article.id
    );
    assertType<typeof reloaded>(reloaded);
    validate_index("BbsQuestionArticleProvider.update()", article.contents, reloaded.contents);
}