import { HttpException } from "@nestjs/common";

import { IDiagnosis } from "@ORGANIZATION/PROJECT-api/lib/structures/common/IDiagnosis";

export namespace ErrorProvider {
  const http =
    (status: number) =>
    (reason: string | IDiagnosis | IDiagnosis[]): HttpException => {
      const diagnoses: IDiagnosis[] =
        typeof reason === "string"
          ? [
              {
                message: reason,
                accessor: "unknown",
              },
            ]
          : Array.isArray(reason)
            ? reason
            : [reason];
      return new HttpException(diagnoses, status);
    };

  export const badRequest = http(400);
  export const unauthorized = http(401);
  export const paymentRequired = http(402);
  export const forbidden = http(403);
  export const notFound = http(404);
  export const conflict = http(409);
  export const gone = http(410);
  export const unprocessable = http(422);
  export const iamTeaPot = http(418);
  export const internal = http(500);
}
