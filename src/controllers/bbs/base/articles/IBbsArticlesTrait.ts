import * as express from "express";
import safe from "safe-typeorm";

import { BbsSection } from "../../../../models/tables/bbs/systematics/BbsSection";

export interface IBbsArticlesTrait<Actor extends safe.Model>
{
    authorize(request: express.Request, write: boolean, section: BbsSection): Promise<Actor>;
}