import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import { err, ok, ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import { v4 as uuid } from "uuid";
import z from "zod";
import { type AppDatabase, database } from "../../../database";

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

  if (result.isErr()) {
    throw result.error;
  } else {
    return result.value;
  }
});

class CreateRootTemplateUseCase {
  public constructor(private db: AppDatabase) { }

  public execute(input: z.infer<typeof dtoSchema>) {
    return ResultAsync.fromPromise(
      this.db.query.project.findFirst({
        where: eq(drizzleSchema.project.id, input.projectId),
      }),
      (e) => ({
        kind: "DATABASE_ERROR" as const,
        cause: e,
      }),
    )
      .andThen((project) => {
        if (!project) {
          return err({ kind: "PROJECT_NOT_FOUND" as const });
        }
        return ok(project);
      })
      .andThen((project) =>
        ResultAsync.fromPromise(
          this.db.query.templates.findFirst({
            where: eq(drizzleSchema.templates.projectId, input.projectId),
          }),
          (e) => ({
            kind: "DATABASE_ERROR" as const,
            cause: e,
          }),
        ),
      )
      .andThen((template) => {
        if (template !== undefined) {
          return err({ kind: "PROJECT_ALREADY_HAS_TEMPLATES" as const });
        }
        return ok();
      })
      .andThen(() =>
        ResultAsync.fromPromise(
          this.db
            .insert(drizzleSchema.templates)
            .values({
              id: uuid(),
              name: "Root template",
              projectId: input.projectId,
              isRoot: true,
              parentId: undefined,
            })
            .returning(),
          (e) => ({
            kind: "DATABASE_ERROR" as const,
            cause: e,
          }),
        ),
      )
      .andThen((insertResult) => {
        if (insertResult.length > 1) {
          return err({
            kind: "DB_RETURNED_TOO_MANY_VALUES" as const,
          });
        } else if (!insertResult[0]) {
          return err({
            kind: "DB_RETURNED_ZERO_VALUES" as const,
          });
        } else {
          return ok(insertResult[0]);
        }
      });
  }
}
