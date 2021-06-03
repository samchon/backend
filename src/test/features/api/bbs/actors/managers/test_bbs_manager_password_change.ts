import api from "../../../../../../api";
import { IBbsManager } from "../../../../../../api/structures/bbs/actors/IBbsManager";
import { Configuration } from "../../../../../../Configuration";
import { RandomGenerator } from "../../../../../../utils/RandomGenerator";
import { exception_must_be_thrown } from "../../../../../internal/exception_must_be_thrown";
import { test_bbs_manager_login } from "./test_bbs_manager_login";

function login(connection: api.IConnection, email: string, password: string): Promise<IBbsManager>
{
    return api.functional.bbs.managers.authenticate.login
    (
        connection,
        {
            email,
            password
        }
    );
}

export async function test_bbs_manager_password_change(connection: api.IConnection): Promise<void>
{
    const manager: IBbsManager = await test_bbs_manager_login(connection);
    const email: string = manager.email;
    const password: string = RandomGenerator.alphabets(64);

    // CHANGE PASSWORD
    await api.functional.bbs.managers.authenticate.password.change
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
        "Login as manager after password change",
        () => login(connection, email, Configuration.SYSTEM_PASSWORD)
    );

    // TRY NEW PASSWORD
    await login(connection, email, password);

    // RESTORE OLD PASSWORD
    await api.functional.bbs.managers.authenticate.password.change
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
        "Login as manager after password re-changing",
        () => login(connection, email, password)
    );

    // TRY OLD PASSWORD
    await login(connection, email, Configuration.SYSTEM_PASSWORD);
}