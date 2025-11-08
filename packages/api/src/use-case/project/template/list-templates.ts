import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import z from "zod";
import { type AppDatabase, database } from "../../../database";

const dtoSchema = z.object({
  projectId: z.string(),
});
type DTO = z.infer<typeof dtoSchema>;

export const listTemplateProcedure = os.input(dtoSchema).handler(async ({ input }) => {
  const uc = new ListTemplatesUseCase(database);
  const result = await uc.execute(input).mapErr((err) => new ORPCError("INTERNAL_SERVER_ERROR"));
  if (result.isErr()) {
    throw result.error;
  } else {
    return result.value;
  }
});

class ListTemplatesUseCase {
  public constructor(private db: AppDatabase) { }

  public execute(input: DTO) {
    return ResultAsync.fromPromise(
      this.db.query.templates.findMany({
        where: eq(drizzleSchema.templates.projectId, input.projectId),
      }),
      (e) => ({
        kind: "DATABASE_ERROR" as const,
        cause: e,
      }),
    );
  }
}
