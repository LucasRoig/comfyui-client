import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { and, eq } from "drizzle-orm";
import { ok } from "neverthrow";
import { match } from "ts-pattern";
import { v4 as uuid } from "uuid";
import z from "zod";
import { type AppDatabase, database } from "../../../database";
import { DbUtils } from "../../../db-utils";
import { ResultUtils } from "../../../result-utils";

const dtoSchema = z.object({
  projectId: z.string().min(3),
  parentId: z.string().min(3),
  name: z.string().trim().min(1),
});

export const createChildTemplateProcedure = os.input(dtoSchema).handler(async ({ input }) => {
  const uc = new CreateChildTemplateUseCase(database);
  const result = await uc
    .execute(input)
    .orTee((e) => console.error(e))
    .mapErr((e) =>
      match(e)
        .with({ kind: "DATABASE_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .with({ kind: "DB_RETURNED_TOO_MANY_VALUES" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .with({ kind: "DB_RETURNED_ZERO_VALUES" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .with({ kind: "PARENT_TEMPLATE_NOT_FOUND" }, () => new ORPCError("NOT_FOUND"))
        .with(
          { kind: "TEMPLATE_WITH_SAME_NAME_ALREADY_EXISTS" },
          () =>
            new ORPCError("BAD_REQUEST", {
              message: "A template with this name already exists",
            }),
        )
        .exhaustive(),
    );
  return ResultUtils.unwrapOrThrow(result);
});

class CreateChildTemplateUseCase {
  public constructor(private db: AppDatabase) {}

  public execute(input: z.infer<typeof dtoSchema>) {
    return DbUtils.execute(
      this.db.query.templates.findFirst({
        where: and(
          eq(drizzleSchema.templates.id, input.parentId),
          eq(drizzleSchema.templates.projectId, input.projectId),
        ),
      }),
    )
      .andThen((parentTemplate) => {
        if (!parentTemplate) {
          return ResultUtils.simpleError("PARENT_TEMPLATE_NOT_FOUND");
        }
        return ok();
      })
      .andThen(() =>
        DbUtils.execute(
          this.db.query.templates.findFirst({
            where: and(
              eq(drizzleSchema.templates.projectId, input.projectId),
              eq(drizzleSchema.templates.name, input.name),
            ),
          }),
        ),
      )
      .andThen((templateWithSameName) => {
        if (templateWithSameName) {
          return ResultUtils.simpleError("TEMPLATE_WITH_SAME_NAME_ALREADY_EXISTS");
        }
        return ok();
      })
      .andThen(() =>
        DbUtils.execute(
          this.db
            .insert(drizzleSchema.templates)
            .values({
              id: uuid(),
              name: input.name,
              projectId: input.projectId,
              isRoot: false,
              parentId: input.parentId,
            })
            .returning(),
        ),
      )
      .andThen(DbUtils.expectOneValue);
  }
}
