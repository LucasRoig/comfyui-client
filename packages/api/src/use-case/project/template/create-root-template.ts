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
    const result = await uc
      .execute(input)
      .orTee((e) => console.error(e))
      .mapErr((err) =>
        match(err)
          .with({ kind: "DATABASE_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
          .with({ kind: "DB_RETURNED_TOO_MANY_VALUES" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
          .with({ kind: "DB_RETURNED_ZERO_VALUES" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
          .with({ kind: "FIELD_INSERTION_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
          .with(
            { kind: "PROJECT_ALREADY_HAS_TEMPLATES" },
            () =>
              new ORPCError("BAD_REQUEST", {
                message: "PROJECT_ALREADY_HAS_TEMPLATES",
              }),
          )
          .with(
            { kind: "PROJECT_NOT_FOUND" },
            () =>
              new ORPCError("NOT_FOUND", {
                message: "PROJECT_NOT_FOUND",
              }),
          )
          .exhaustive(),
      );

    return ResultUtils.unwrapOrThrow(result);
  });
});

class CreateRootTemplateUseCase {
  public constructor(private db: AppDatabase) { }

  public execute(input: z.infer<typeof dtoSchema>) {
    return DbUtils.executeAndExpectDefined(
      () =>
        this.db.query.projects.findFirst({
          where: eq(drizzleSchema.projects.id, input.projectId),
        }),
      "PROJECT_NOT_FOUND",
    )
      .andThen(() =>
        DbUtils.executeAndExpectUndefined(
          () =>
            this.db.query.templates.findFirst({
              where: eq(drizzleSchema.templates.projectId, input.projectId),
            }),
          "PROJECT_ALREADY_HAS_TEMPLATES",
        ),
      )
      .andThen(() =>
        DbUtils.executeAndReturnOneRow(() =>
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
        ),
      )
      .andThen((template) =>
        DbUtils.execute(() =>
          this.db
            .insert(drizzleSchema.templateFields)
            .values([
              {
                id: uuid(),
                fieldId: "original_input_image",
                fieldLabel: "Original Image",
                x: 0,
                y: 0,
                width: 1,
                height: 1,
                templateId: template.id,
              },
              {
                id: uuid(),
                fieldId: "output_image_0",
                fieldLabel: "Output Image",
                x: 0,
                y: 0,
                width: 1,
                height: 1,
                templateId: template.id,
              },
            ])
            .returning(),
        ).map((res) => ({
          template,
          insertFieldResult: res,
        })),
      )
      .andThen((result) => {
        if (!result.insertFieldResult[0] || !result.insertFieldResult[1]) {
          return ResultUtils.simpleError("FIELD_INSERTION_ERROR");
        }
        return ok({
          template: result.template,
          inputImageField: result.insertFieldResult[0],
          outputImageField: result.insertFieldResult[1],
        });
      })
      .andThen((templateAndFields) =>
        DbUtils.executeAndReturnOneRow(() =>
          this.db
            .insert(drizzleSchema.templateInputImageFields)
            .values({
              id: uuid(),
              fieldId: templateAndFields.inputImageField.id,
            })
            .returning(),
        ).map((inputImageField) => ({
          ...templateAndFields,
          inputImageField,
        })),
      )
      .andThen((templateAndFields) =>
        DbUtils.executeAndReturnOneRow(() =>
          this.db
            .insert(drizzleSchema.templateOutputImageFields)
            .values({
              id: uuid(),
              fieldId: templateAndFields.outputImageField.id,
            })
            .returning(),
        ).map((outputImageField) => ({
          ...templateAndFields,
          outputImageField,
        })),
      )
      .map((result) => result.template);
  }
}
