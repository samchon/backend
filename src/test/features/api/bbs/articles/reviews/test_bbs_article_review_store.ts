import { randint } from "tstl/algorithm/random";
import { assertType } from "typescript-is";

import api from "../../../../../../api";
import { IBbsReviewArticle } from "../../../../../../api/structures/bbs/articles/IBbsReviewArticle";
import { IBbsSection } from "../../../../../../api/structures/bbs/systematic/IBbsSection";

import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { test_bbs_customer_activate } from "../../actors/consumers/test_bbs_customer_activate";
import { test_bbs_customer_join } from "../../actors/consumers/test_bbs_customer_join";
import { generate_bbs_section } from "../internal/generate_bbs_section";
import { prepare_random_article_content } from "../internal/prepare_random_article_content";

export async function test_bbs_article_review_store
    (connection: api.IConnection): Promise<[ IBbsSection, IBbsReviewArticle ]>
{
    const section: IBbsSection = await generate_bbs_section(connection, "review");
    if (Math.random() < .5)
        await test_bbs_customer_join(connection);
    else
        await test_bbs_customer_activate(connection);

    const article: IBbsReviewArticle = await api.functional.bbs.customers.articles.reviews.store
    (
        connection,
        section.code,
        {
            ...prepare_random_article_content(),
            score: randint(0, 100),
            brand: RandomGenerator.name(),
            product: RandomGenerator.name(),
            manufacturer: RandomGenerator.name(),
            purchased_at: new Date().toString()
        }
    );
    assertType<typeof article>(article);

    return [ section, article ];
}