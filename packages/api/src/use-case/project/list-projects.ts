import { ORPCError, os } from "@orpc/server";
import { type AppDatabase, database } from "../../database";
import { DbUtils } from "../../db-utils";
import { ResultUtils } from "../../result-utils";

export const listProjectProcedure = os.handler(async () => {
  const useCase = new ListProjectUseCase(database);
  const result = await useCase.execute().mapErr(e => new ORPCError("INTERNAL_SERVER_ERROR"));
  return ResultUtils.unwrapOrThrow(result);
});

class ListProjectUseCase {
  public constructor(private db: AppDatabase) { }

  public execute() {
    return DbUtils.execute(this.db.query.project.findMany());
  }
}
