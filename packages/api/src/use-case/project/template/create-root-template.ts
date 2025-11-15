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
  return database.transaction(async (tx) => {
    const uc = new CreateRootTemplateUseCase(tx);
    const result = await uc.execute(input).orTee(e => console.error(e)).mapErr((err) =>
      match(err)
        .with({ kind: "DATABASE_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .with({ kind: "DB_RETURNED_TOO_MANY_VALUES" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .with({ kind: "DB_RETURNED_ZERO_VALUES" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .with({ kind: "FIELD_INSERTION_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .with({ kind: "PROJECT_ALREADY_HAS_TEMPLATES" }, () => new ORPCError("BAD_REQUEST", {
          message: "PROJECT_ALREADY_HAS_TEMPLATES"
        }))
        .with({ kind: "PROJECT_NOT_FOUND" }, () => new ORPCError("NOT_FOUND", {
          message: "PROJECT_NOT_FOUND"
        }))
        .exhaustive(),
    );

    return ResultUtils.unwrapOrThrow(result);
  })
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
    ).andThen(DbUtils.expectOneValue)
      .andThen((template) => DbUtils.execute(
        this.db.insert(drizzleSchema.templateField).values([
          { id: uuid(), fieldId: "original_input_image", fieldLabel: "Original Image", position: "", templateId: template.id },
          { id: uuid(), fieldId: "output_image_0", fieldLabel: "Output Image", position: "", templateId: template.id },
        ])
          .returning()
          .then(res => ({
            template,
            insertFieldResult: res
          }))
      )).andThen((result) => {
        if (!result.insertFieldResult[0] || !result.insertFieldResult[1]) {
          return ResultUtils.simpleError("FIELD_INSERTION_ERROR")
        }
        return ok({
          template: result.template,
          inputImageField: result.insertFieldResult[0],
          outputImageField: result.insertFieldResult[1]
        })
      })
      .andThen((templateAndFields) => DbUtils.execute(
        this.db.insert(drizzleSchema.templateInputImageFields).values({
          id: uuid(),
          fieldId: templateAndFields.inputImageField.id,
        }).returning().then(insertInputImageFieldResult => ({
          ...templateAndFields,
          insertInputImageFieldResult
        }))
      )).andThen((templateAndFields) => DbUtils.execute(
        this.db.insert(drizzleSchema.templateOutputImageFields).values({
          id: uuid(),
          fieldId: templateAndFields.outputImageField.id
        }).returning().then(insertOutputImageFieldResult => ({
          ...templateAndFields,
          insertOutputImageFieldResult
        }))
      )).andThen((result) => {
        const inputImageField = DbUtils.expectOneValue(result.insertInputImageFieldResult);
        if (inputImageField.isErr()) {
          return inputImageField;
        }
        const outputImageField = DbUtils.expectOneValue(result.insertOutputImageFieldResult);
        if (outputImageField.isErr()) {
          return outputImageField;
        }
        return ok(result.template)
      });
  }
}
