import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsAnswerArticle } from "../../../../../../api/structures/bbs/articles/IBbsAnswerArticle";
import { IBbsQuestionArticle } from "../../../../../../api/structures/bbs/articles/IBbsQuestionArticle";

import { validate_index } from "../../../../../internal/validate_index";
import { prepare_random_article_content } from "../internal/prepare_random_article_content";

import { test_bbs_article_answer_store } from "./test_bbs_article_answer_store";

const REPEAT = 4;

export async function test_bbs_article_answer_update(connection: api.IConnection): Promise<void>
{
    const [ section, question ] = await test_bbs_article_answer_store(connection);
    const answer: IBbsAnswerArticle = question.answer!;

    for (let i: number = 0; i < REPEAT; ++i)
    {
        const content: IBbsAnswerArticle.IContent = await api.functional.bbs.managers.articles.questions.update
        (
            connection,
            section.code,
            question.id,
            prepare_random_article_content()
        );
        assertType<typeof content>(content);
        answer.contents.push(content);
    }

    const reloaded: IBbsQuestionArticle = await api.functional.bbs.customers.articles.questions.at
    (
        connection,
        section.code,
        question.id
    );
    assertType<typeof reloaded>(reloaded);
    validate_index("BbsNoticeArticleProvider.update()", answer.contents, reloaded.answer!.contents);
}