import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { and, eq } from "drizzle-orm";
import { err, ok } from "neverthrow";
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
  return database.transaction(async (tx) => {
    const uc = new CreateChildTemplateUseCase(tx);
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
          .with({ kind: "MISSING_STRING_FIELDS_IN_MAP" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
          .with({ kind: "MISSING_INPUT_IMAGE_FIELDS_IN_MAP" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
          .with({ kind: "MISSING_OUTPUT_IMAGE_FIELDS_IN_MAP" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
          .with({ kind: "FIELD_WITH_NO_TYPE" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
          .exhaustive(),
      );
    return ResultUtils.unwrapOrThrow(result);
  }).catch(e => {
    console.error(e)
    throw e;
  });
});

class CreateChildTemplateUseCase {
  public constructor(private db: AppDatabase) { }

  public execute(input: z.infer<typeof dtoSchema>) {
    return DbUtils.executeAndExpectDefined(
      () => this.db.query.templates.findFirst({
        where: and(
          eq(drizzleSchema.templates.id, input.parentId),
          eq(drizzleSchema.templates.projectId, input.projectId),
        ),
        with: {
          fields: {
            with: {
              inputImageField: true,
              outputImageField: true,
              stringField: true,
            },
          },
        },
      }),
      "PARENT_TEMPLATE_NOT_FOUND",
    )
      .andThrough(() =>
        DbUtils.executeAndExpectUndefined(
          () => this.db.query.templates.findFirst({
            where: and(
              eq(drizzleSchema.templates.projectId, input.projectId),
              eq(drizzleSchema.templates.name, input.name),
            ),
          }),
          "TEMPLATE_WITH_SAME_NAME_ALREADY_EXISTS",
        ),
      )
      .andThen((parentTemplate) =>
        DbUtils.executeAndReturnOneRow(
          () => this.db
            .insert(drizzleSchema.templates)
            .values({
              id: uuid(),
              name: input.name,
              projectId: input.projectId,
              isRoot: false,
              parentId: input.parentId,
            })
            .returning(),
        ).map((childTemplate) => ({ childTemplate, parentTemplate })),
      )
      .andThen((templates) => {
        type FullField = typeof templates["parentTemplate"]["fields"][number];
        type BaseField = Omit<
          FullField,
          'stringField' | "inputImageField" | "outputImageField"
        >
        const stringFields: Array<BaseField & { stringField: FullField["stringField"][number] }> = []
        const inputImageFields: Array<BaseField & { inputImageField: FullField["inputImageField"][number] }> = []
        const outputImageFields: Array<BaseField & { outputImageField: FullField["outputImageField"][number] }> = []
        for (const field of templates.parentTemplate.fields) {
          const { inputImageField, outputImageField, stringField, ...rest } = field
          if (inputImageField[0]) {
            inputImageFields.push({
              ...rest,
              inputImageField: inputImageField[0]
            })
          } else if (outputImageField[0]) {
            outputImageFields.push({
              ...rest,
              outputImageField: outputImageField[0]
            })
          } else if (stringField[0]) {
            stringFields.push({
              ...rest,
              stringField: stringField[0]
            })
          } else {
            return err({ kind: "FIELD_WITH_NO_TYPE" as const, fieldId: field.id })
          }
        }
        return ok({
          ...templates,
          fields: {
            inputImageFields,
            outputImageFields,
            stringFields
          }
        })
      })
      .map((templates) => ({
        ...templates,
        insertFieldsPayload: [
          ...templates.fields.inputImageFields,
          ...templates.fields.outputImageFields,
          ...templates.fields.stringFields
        ]
      }))
      .andThen((templates) => DbUtils.execute(
        () => this.db.insert(drizzleSchema.templateField).values(
          templates.insertFieldsPayload.map(f => ({
            id: uuid(),
            templateId: templates.childTemplate.id,
            fieldId: f.fieldId,
            fieldLabel: f.fieldLabel,
            position: f.position
          }))
        ).returning()
      ).map(insertFieldsResult => ({ ...templates, insertFieldsResult })))
      .andThen(({ insertFieldsPayload: _, insertFieldsResult, ...rest }) => {
        const insertedIdByFieldId = new Map<string, string>();
        for (const f of insertFieldsResult) {
          insertedIdByFieldId.set(f.fieldId, f.id);
        }
        const insertStringFieldsPayload = rest.fields.stringFields.map(f => ({
          ...f,
          id: insertedIdByFieldId.get(f.fieldId),
        })).filter((f): f is Omit<typeof f, "id"> & { id: string } => f.id !== undefined)
        const insertInputImageFieldsPayload = rest.fields.inputImageFields.map(f => ({
          ...f,
          id: insertedIdByFieldId.get(f.fieldId),
        })).filter((f): f is Omit<typeof f, "id"> & { id: string } => f.id !== undefined)
        const insertOutputImageFieldsPayload = rest.fields.outputImageFields.map(f => ({
          ...f,
          id: insertedIdByFieldId.get(f.fieldId),
        })).filter((f): f is Omit<typeof f, "id"> & { id: string } => f.id !== undefined)
        if (insertStringFieldsPayload.length !== rest.fields.stringFields.length) {
          return ResultUtils.simpleError("MISSING_STRING_FIELDS_IN_MAP")
        }
        if (insertInputImageFieldsPayload.length !== rest.fields.inputImageFields.length) {
          return ResultUtils.simpleError("MISSING_INPUT_IMAGE_FIELDS_IN_MAP")
        }
        if (insertOutputImageFieldsPayload.length !== rest.fields.outputImageFields.length) {
          return ResultUtils.simpleError("MISSING_OUTPUT_IMAGE_FIELDS_IN_MAP")
        }
        return ok({
          ...rest,
          insertStringFieldsPayload,
          insertInputImageFieldsPayload,
          insertOutputImageFieldsPayload,
        })
      }).andThrough(({ insertStringFieldsPayload }) => DbUtils.executeIf(
        insertStringFieldsPayload.length > 0,
        () => this.db.insert(drizzleSchema.templateStringFields).values(
          insertStringFieldsPayload.map(f => ({
            id: uuid(),
            fieldId: f.id,
            parentFieldId: f.stringField.id
          }))
        )
      )).andThrough(({ insertInputImageFieldsPayload }) => DbUtils.executeIf(
        insertInputImageFieldsPayload.length > 0,
        () => this.db.insert(drizzleSchema.templateInputImageFields).values(
          insertInputImageFieldsPayload.map(f => ({
            id: uuid(),
            fieldId: f.id,
            parentFieldId: f.inputImageField.id
          }))
        )
      )).andThrough(({ insertOutputImageFieldsPayload }) => DbUtils.executeIf(
        insertOutputImageFieldsPayload.length > 0,
        () => this.db.insert(drizzleSchema.templateOutputImageFields).values(
          insertOutputImageFieldsPayload.map(f => ({
            id: uuid(),
            fieldId: f.id,
            parentFieldId: f.outputImageField.id
          }))
        )
      )).map(({ childTemplate }) => childTemplate);
  }
}
