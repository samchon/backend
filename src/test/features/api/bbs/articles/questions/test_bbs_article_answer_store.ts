import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsAnswerArticle } from "../../../../../../api/structures/bbs/articles/IBbsAnswerArticle";
import { IBbsQuestionArticle } from "../../../../../../api/structures/bbs/articles/IBbsQuestionArticle";
import { IBbsSection } from "../../../../../../api/structures/bbs/systematic/IBbsSection";

import { prepare_random_article_content } from "../internal/prepare_random_article_content";
import { test_bbs_article_question_store } from "./test_bbs_article_question_store";

export async function test_bbs_article_answer_store
    (
        connection: api.IConnection
    ): Promise<[ IBbsSection, IBbsQuestionArticle ]>
{
    const [ section, question ] = await test_bbs_article_question_store(connection);

    const answer: IBbsAnswerArticle = await api.functional.bbs.managers.articles.questions.store
    (
        connection,
        section.code,
        question.id,
        prepare_random_article_content()
    );
    question.answer = assertType<typeof answer>(answer);

    return [ section, question ];
}