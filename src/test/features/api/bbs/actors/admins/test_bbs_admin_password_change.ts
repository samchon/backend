import api from "../../../../../../api";
import { IBbsAdministrator } from "../../../../../../api/structures/bbs/actors/IBbsAdministrator";
import { Configuration } from "../../../../../../Configuration";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { exception_must_be_thrown } from "../../../../../internal/exception_must_be_thrown";
import { test_api_bbs_admin_login } from "./test_bbs_admin_login";

export async function test_bbs_admin_password_change(connection: api.IConnection): Promise<void>
{
    const admin: IBbsAdministrator = await test_api_bbs_admin_login(connection);
    const email: string = admin.email;
    const password: string = RandomGenerator.alphabets(64);

    // CHANGE PASSWORD
    await api.functional.bbs.admins.authenticate.password.change
    (
        connection,
        {
            oldbie: Configuration.SYSTEM_PASSWORD,
            newbie: password
        }
    );

    // TRY OLD PASSWORD
    await exception_must_be_thrown
    (
        "Login as administrator after password change", 
        () => test_api_bbs_admin_login(connection)
    );

    // TRY NEW PASSWORD
    await api.functional.bbs.admins.authenticate.login
    (
        connection,
        {
            email,
            password
        }
    );

    // RESTOARE OLD PASSWORD
    await api.functional.bbs.admins.authenticate.password.change
    (
        connection,
        {
            oldbie: password,
            newbie: Configuration.SYSTEM_PASSWORD
        }
    );

    // TRY NEW PASSWORD
    await exception_must_be_thrown
    (
        "Login after administrator after password re-changing",
        () => api.functional.bbs.admins.authenticate.login
        (
            connection,
            {
                email,
                password
            }
        )
    );

    // TRY OLD PASSWORD
    await test_api_bbs_admin_login(connection);
}