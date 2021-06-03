import api from "../../../../../../api";

export function bbs_customer_logout(connection: api.IConnection): void
{
    delete (connection.headers as any)["bbs-customer-authorization"];
}