import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { err, ok, ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import { v4 as uuid } from "uuid";
import z from "zod";
import { type AppDatabase, database } from "../../database";

export const createProjectDTOSchema = z.object({
  name: z.string().min(3),
});
type CreateProjectDTO = z.infer<typeof createProjectDTOSchema>;

export const createProjectProcedure = os.input(createProjectDTOSchema).handler(async ({ input }) => {
  const uc = new CreateProjectUseCase(database);
  const result = (await uc.execute(input)).mapErr((err) =>
    match(err).otherwise(() => new ORPCError("INTERNAL_SERVER_ERROR")),
  );
  if (result.isErr()) {
    throw result.error;
  } else {
    return result.value;
  }
});

class CreateProjectUseCase {
  public constructor(private db: AppDatabase) {}

  public async execute(input: CreateProjectDTO) {
    return ResultAsync.fromPromise(
      this.db
        .insert(drizzleSchema.project)
        .values({
          name: input.name,
          id: uuid(),
        })
        .returning(),
      (e) => ({
        kind: "DATABASE_ERROR" as const,
        cause: e,
      }),
    ).andThen((e) => {
      if (e.length > 1) {
        return err({
          kind: "DB_RETURNED_TOO_MANY_VALUES" as const,
        });
      } else if (!e[0]) {
        return err({
          kind: "DB_RETURNED_ZERO_VALUES" as const,
        });
      } else {
        return ok(e[0]);
      }
    });
  }
}
