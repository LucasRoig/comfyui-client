import { ok, okAsync, ResultAsync } from "neverthrow";
import { ResultUtils } from "./result-utils";

export const DbUtils = {
  execute: <T>(promise: () => Promise<T>) =>
    ResultAsync.fromThrowable(promise, (e) => ({
      kind: "DATABASE_ERROR" as const,
      cause: e,
    }))(),
  executeIf: <T>(condition: boolean, promise: () => Promise<T>) =>
    condition ? DbUtils.execute(promise).andThen(() => okAsync()) : okAsync(),
  executeAndExpectDefined: <T, TError extends string>(promise: () => Promise<T | undefined | null>, error: TError) =>
    DbUtils.execute(promise)
      .andThen(r => r === null || r === undefined ? ResultUtils.simpleError(error) : ok(r))
  ,
  executeAndExpectUndefined: <T, TError extends string>(promise: () => Promise<T | undefined | null>, error: TError) =>
    DbUtils.execute(promise)
      .andThen(r => r !== null && r !== undefined ? ResultUtils.simpleError(error) : ok())
  ,
  executeAndReturnOneRow: <T>(promise: () => Promise<T[]>) => DbUtils.execute(promise).andThen(DbUtils.expectOneValue),
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
