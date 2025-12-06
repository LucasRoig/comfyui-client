import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { match } from "ts-pattern";
import { v4 as uuid } from "uuid";
import z from "zod";
import { type AppDatabase, database } from "../../database";
import { DbUtils } from "../../db-utils";
import { ResultUtils } from "../../result-utils";

export const createProjectDTOSchema = z.object({
  name: z.string().min(3),
});
type CreateProjectDTO = z.infer<typeof createProjectDTOSchema>;

export const createProjectProcedure = os.input(createProjectDTOSchema).handler(async ({ input }) => {
  const uc = new CreateProjectUseCase(database);
  const result = (await uc.execute(input))
    .orTee((e) => console.error(e))
    .mapErr((err) => match(err).otherwise(() => new ORPCError("INTERNAL_SERVER_ERROR")));
  return ResultUtils.unwrapOrThrow(result);
});

class CreateProjectUseCase {
  public constructor(private db: AppDatabase) {}

  public async execute(input: CreateProjectDTO) {
    return DbUtils.executeAndReturnOneRow(() =>
      this.db
        .insert(drizzleSchema.projects)
        .values({
          name: input.name,
          id: uuid(),
        })
        .returning(),
    );
  }
}
