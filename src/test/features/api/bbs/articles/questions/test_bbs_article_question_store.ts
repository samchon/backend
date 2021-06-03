import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsQuestionArticle } from "../../../../../../api/structures/bbs/articles/IBbsQuestionArticle";
import { IBbsSection } from "../../../../../../api/structures/bbs/systematics/IBbsSection";

import { test_bbs_customer_activate } from "../../actors/consumers/test_bbs_customer_activate";
import { test_bbs_customer_join } from "../../actors/consumers/test_bbs_customer_join";
import { generate_bbs_section } from "../internal/generate_bbs_section";
import { prepare_random_article_content } from "../internal/prepare_random_article_content";

export async function test_bbs_article_question_store
    (
        connection: api.IConnection
    ): Promise<[ IBbsSection, IBbsQuestionArticle ]>
{
    const section: IBbsSection = await generate_bbs_section(connection, "QNA");
    if (Math.random() < .5)
        await test_bbs_customer_join(connection);
    else
        await test_bbs_customer_activate(connection);

    const article: IBbsQuestionArticle = await api.functional.bbs.customers.articles.questions.store
    (
        connection,
        section.code,
        prepare_random_article_content()
    );
    assertType<typeof article>(article);

    return [ section, article ];
}