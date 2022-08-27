import nest from "@modules/nestjs";
import orm from "@modules/typeorm";
import helper from "nestia-helper";
import { DomainError, InvalidArgument, OutOfRange } from "tstl";

import { ErrorUtil } from "../utils/ErrorUtil";

// CUSTOM EXCEPTIION CONVERSION
helper.ExceptionManager.insert(
    orm.EntityNotFoundError,
    (exp) => new nest.NotFoundException(exp.message),
);
helper.ExceptionManager.insert(
    OutOfRange,
    (exp) => new nest.NotFoundException(exp.message),
);
helper.ExceptionManager.insert(
    InvalidArgument,
    (exp) => new nest.ConflictException(exp.message),
);
helper.ExceptionManager.insert(
    DomainError,
    (exp) => new nest.UnprocessableEntityException(exp.message),
);

// ERROR FROM THE DATABASE
helper.ExceptionManager.insert(orm.QueryFailedError, (exp) => {
    if (exp.message.indexOf("ER_DUP_ENTRY: ") !== -1)
        return new nest.ConflictException("Blocked by unique constraint.");
    else if (exp.message.indexOf("ER_NO_REFERENCED_ROW_2") !== -1)
        return new nest.NotFoundException("Blocked by foreign constraint.");
    return new nest.InternalServerErrorException(exp.message);
});

// TRACE EXACT SERVER INTERNAL ERROR
helper.ExceptionManager.insert(
    Error,
    (exp) =>
        new nest.InternalServerErrorException({
            message: exp.message,
            name: exp.name,
            stack: exp.stack,
        }),
);

// DEBUG INTERNAL SERVER ERROR
nest.InternalServerErrorException.prototype.getResponse = function (
    this: nest.InternalServerErrorException,
): string | object {
    const output: string | object =
        nest.HttpException.prototype.getResponse.call(this);
    ErrorUtil.log("internal_server_error", this).catch(() => {});
    return output;
};
