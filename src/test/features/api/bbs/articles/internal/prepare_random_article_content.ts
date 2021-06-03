import { randint } from "tstl/algorithm/random";

import { IBbsArticle } from "../../../../../../api/structures/bbs/articles/IBbsArticle";

import { ArrayUtil } from "../../../../../../utils/ArrayUtil";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { prepare_random_attachment_file } from "./prepare_random_attachment_file";

export function prepare_random_article_content(): IBbsArticle.IStore
{
    return {
        title: RandomGenerator.paragraph(randint(2, 5)),
        body: RandomGenerator.content(randint(3, 7)),
        files: ArrayUtil.repeat(randint(0, 4), prepare_random_attachment_file)
    }
}