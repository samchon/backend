import * as nest from "@nestjs/common";
import { BbsCommentsController } from "../../base/articles/BbsCommentsController";

@nest.Controller("bbs/admins/articles/:type/:code/:id/comments")
export class BbsAdminCommentsController extends BbsCommentsController
{
}