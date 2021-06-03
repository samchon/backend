import { randint } from "tstl/algorithm/random";
import { assertType } from "typescript-is";
import api from "../../../../../../api";
import { IBbsReviewArticle } from "../../../../../../api/structures/bbs/articles/IBbsReviewArticle";
import { validate_index } from "../../../../../internal/validate_index";
import { prepare_random_article_content } from "../internal/prepare_random_article_content";
import { test_bbs_article_review_store } from "./test_bbs_article_review_store";

const REPEAT = 4;

export async function test_bbs_article_review_update(connection: api.IConnection): Promise<void>
{
    const [ section, article ] = await test_bbs_article_review_store(connection);
    for (let i: number = 0; i < REPEAT; ++i)
    {
        const content: IBbsReviewArticle.IContent = await api.functional.bbs.customers.articles.reviews.update
        (
            connection,
            section.code,
            article.id,
            {
                ...prepare_random_article_content(),
                score: randint(0, 100)
            }
        );
        assertType<typeof content>(content);
    }

    const reloaded: IBbsReviewArticle = await api.functional.bbs.customers.articles.reviews.at
    (
        connection,
        section.code,
        article.id
    );
    assertType<typeof reloaded>(reloaded);
    validate_index("BbsReviewArticleProvider.update()", article.contents, reloaded.contents);
}