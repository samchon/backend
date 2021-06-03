import { assertType } from "typescript-is";
import api from "../../../../../../api";
import { IMember } from "../../../../../../api/structures/members/IMember";
import { test_bbs_customer_issue } from "../consumers/test_bbs_customer_issue";
import { bbs_customer_logout } from "./bbs_customer_logout";

export async function bbs_customer_re_login
    (
        connection: api.IConnection,
        email: string,
        password: string
    ): Promise<IMember>
{
    bbs_customer_logout(connection);
    await test_bbs_customer_issue(connection);

    const member: IMember = await api.functional.bbs.customers.authenticate.login
    (
        connection,
        {
            email,
            password
        }
    );
    return assertType<typeof member>(member);
}