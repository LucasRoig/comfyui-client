import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import { ok } from "neverthrow";
import { match } from "ts-pattern";
import { v4 as uuid } from "uuid";
import z from "zod";
import { type AppDatabase, database } from "../../../database";
import { DbUtils } from "../../../db-utils";
import { ResultUtils } from "../../../result-utils";

const dtoSchema = z.object({
  projectId: z.string(),
});

export const createRootTemplateProcedure = os.input(dtoSchema).handler(async ({ input }) => {
  const uc = new CreateRootTemplateUseCase(database);
  const result = await uc.execute(input).mapErr((err) =>
    match(err)
      .with({ kind: "DATABASE_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
      .with({ kind: "DB_RETURNED_TOO_MANY_VALUES" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
      .with({ kind: "DB_RETURNED_ZERO_VALUES" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
      .with({ kind: "PROJECT_ALREADY_HAS_TEMPLATES" }, () => new ORPCError("BAD_REQUEST", {
        message: "PROJECT_ALREADY_HAS_TEMPLATES"
      }))
      .with({ kind: "PROJECT_NOT_FOUND" }, () => new ORPCError("NOT_FOUND", {
        message: "PROJECT_NOT_FOUND"
      }))
      .exhaustive(),
  );

  return ResultUtils.unwrapOrThrow(result);
});

class CreateRootTemplateUseCase {
  public constructor(private db: AppDatabase) { }

  public execute(input: z.infer<typeof dtoSchema>) {
    return DbUtils.execute(
      this.db.query.project.findFirst({
        where: eq(drizzleSchema.project.id, input.projectId),
      })
    ).andThen((project) => {
      if (!project) {
        return ResultUtils.simpleError("PROJECT_NOT_FOUND")
      }
      return ok();
    }).andThen(() =>
      DbUtils.execute(
        this.db.query.templates.findFirst({
          where: eq(drizzleSchema.templates.projectId, input.projectId),
        })
      ),
    ).andThen((template) => {
      if (template !== undefined) {
        return ResultUtils.simpleError("PROJECT_ALREADY_HAS_TEMPLATES");
      }
      return ok();
    }).andThen(() =>
      DbUtils.execute(
        this.db
          .insert(drizzleSchema.templates)
          .values({
            id: uuid(),
            name: "Root template",
            projectId: input.projectId,
            isRoot: true,
            parentId: undefined,
          })
          .returning()
      ),
    ).andThen(DbUtils.expectOneValue);
  }
}
