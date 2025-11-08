import { err, Result } from "neverthrow";

export const ResultUtils = {
  simpleError: <T extends string,>(errorKind: T) => err({ kind: errorKind }),
  unwrapOrThrow: <T>(result: Result<T, unknown>) => {
    if (result.isErr()) {
      throw result.error;
    } else {
      return result.value;
    }
  }
}
