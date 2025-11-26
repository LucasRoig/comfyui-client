import { ORPCError, os } from "@orpc/server";
import { database } from "../../database";
import { DbUtils } from "../../db-utils";
import { ResultUtils } from "../../result-utils";

export const listProjectProcedure = os.handler(async () => {
  const useCase = {
    execute() {
      return DbUtils.execute(() => database.query.projects.findMany());
    },
  };
  const result = await useCase
    .execute()
    .orTee((e) => console.error(e))
    .mapErr((e) => new ORPCError("INTERNAL_SERVER_ERROR"));
  return ResultUtils.unwrapOrThrow(result);
});

// class ListProjectUseCase {
//   public constructor(private db: AppDatabase) {}

//   public execute() {
//     return DbUtils.execute(() => this.db.query.project.findMany());
//   }
// }
