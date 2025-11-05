import { os } from "@orpc/server";
import { type AppDatabase, database } from "../../database";

export const listProjectProcedure = os.handler(() => {
  const useCase = new ListProjectUseCase(database);
  return useCase.execute();
});

class ListProjectUseCase {
  public constructor(private db: AppDatabase) {}

  public execute() {
    return this.db.query.project.findMany();
  }
}
