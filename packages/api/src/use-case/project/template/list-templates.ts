import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import z from "zod";
import { type AppDatabase, database } from "../../../database";
import { DbUtils } from "../../../db-utils";
import { ResultUtils } from "../../../result-utils";

const dtoSchema = z.object({
  projectId: z.string(),
});
type DTO = z.infer<typeof dtoSchema>;

export const listTemplateProcedure = os.input(dtoSchema).handler(async ({ input }) => {
  const uc = new ListTemplatesUseCase(database);
  const result = await uc.execute(input).mapErr((err) => new ORPCError("INTERNAL_SERVER_ERROR"));
  return ResultUtils.unwrapOrThrow(result);
});

export class ListTemplatesUseCase {
  public constructor(private db: AppDatabase) { }

  public execute(input: DTO) {
    return DbUtils.execute(
      this.db.query.templates.findMany({
        where: eq(drizzleSchema.templates.projectId, input.projectId),
      })
    );
  }
}
