import { assertType } from "typescript-is";

import api from "../../../../../api";
import { IBbsFreeArticle } from "../../../../../api/structures/bbs/articles/IBbsFreeArticle";
import { IBbsSection } from "../../../../../api/structures/bbs/systematic/IBbsSection";

import { test_bbs_customer_activate } from "../actors/consumers/test_bbs_customer_activate";
import { test_bbs_customer_join } from "../actors/consumers/test_bbs_customer_join";
import { generate_bbs_section } from "../articles/internal/generate_bbs_section";
import { prepare_random_article_content } from "../articles/internal/prepare_random_article_content";

import { ArrayUtil } from "../../../../../utils/ArrayUtil";
import { IPage } from "../../../../../api/structures/common/IPage";
import { validate_index } from "../../../../internal/validate_index";

const LIMIT = 4;

async function generate_article
    (
        connection: api.IConnection, 
        section: IBbsSection
    ): Promise<IBbsFreeArticle>
{
    // ACTIVATE CUSTOMER
    if (Math.random() < 0)
        await test_bbs_customer_activate(connection);
    else
        await test_bbs_customer_join(connection);

    // WIRTE A NEW free ARTICEL
    const free: IBbsFreeArticle = await api.functional.bbs.customers.articles.free.store
    (
        connection,
        section.code,
        prepare_random_article_content()
    );
    return assertType<typeof free>(free);
}

export async function test_api_systematic_section_unify(connection: api.IConnection): Promise<void>
{
    const sectionList: IBbsSection[] = await ArrayUtil.asyncRepeat(LIMIT, () => generate_bbs_section(connection, "free"));
    const articleList: IBbsFreeArticle[] = [];

    for (const section of sectionList)
        for (let i: number = 0; i < LIMIT; ++i)
            articleList.push(await generate_article(connection, section));

    const keep: IBbsSection = sectionList[0];
    const absorbed: IBbsSection[] = sectionList.slice(1);

    await api.functional.bbs.admins.systematic.sections.unify
    (
        connection,
        {
            keep_code: keep.code,
            absorbed_codes: absorbed.map(section => section.code)
        }
    );
    
    const page: IPage<IBbsFreeArticle.ISummary> = await api.functional.bbs.admins.articles.free.index
    (
        connection, 
        keep.code, 
        { limit: LIMIT * LIMIT, search: null }
    );
    assertType<typeof page>(page);
    validate_index("summaries after section unification", articleList, page.data);
}