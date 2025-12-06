import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import z from "zod";
import { type AppDatabase, database } from "../../../database";
import { DbUtils } from "../../../db-utils";
import { ResultUtils } from "../../../result-utils";

const dtoSchema = z.object({
  projectId: z.string().min(1),
});
type DTO = z.infer<typeof dtoSchema>;

export const findRootTemplateProcedure = os.input(dtoSchema).handler(async ({ input }) => {
  const uc = new FindRootTemplateUseCase(database);
  const result = await uc
    .execute(input)
    .orTee((e) => console.error(e))
    .mapErr((err) => new ORPCError("INTERNAL_SERVER_ERROR"));
  return ResultUtils.unwrapOrThrow(result);
});

class FindRootTemplateUseCase {
  public constructor(private db: AppDatabase) {}

  public execute(input: DTO) {
    return DbUtils.execute(() =>
      this.db.query.templates.findFirst({
        where: and(eq(drizzleSchema.templates.projectId, input.projectId), eq(drizzleSchema.templates.isRoot, true)),
      }),
    );
  }
}
