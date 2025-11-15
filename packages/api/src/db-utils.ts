import { ok, ResultAsync } from "neverthrow";
import { ResultUtils } from "./result-utils";

export const DbUtils = {
  execute: <T>(promise: PromiseLike<T>) =>
    ResultAsync.fromPromise(promise, (e) => ({
      kind: "DATABASE_ERROR" as const,
      cause: e,
    })),
  expectOneValue: <T>(items: T[]) => {
    if (items.length > 1) {
      return ResultUtils.simpleError("DB_RETURNED_TOO_MANY_VALUES");
    } else if (!items[0]) {
      return ResultUtils.simpleError("DB_RETURNED_ZERO_VALUES");
    } else {
      return ok(items[0]);
    }
  },
};
