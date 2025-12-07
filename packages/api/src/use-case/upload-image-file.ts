import { existsSync } from "node:fs";
import { writeFile as fsWriteFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { type AppDatabase, drizzleSchema } from "@repo/database";
import { and, eq } from "drizzle-orm";
import { err, errAsync, ok, ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import { v4 } from "uuid";
import z, { ZodError } from "zod";
import { database } from "../database";
import { DbUtils } from "../db-utils";
import { ResultUtils } from "../result-utils";

const formDataSchema = z.object({
  relativePath: z
    .string()
    .trim()
    .transform((s) => {
      if (s === "null") return "/";
      if (!s.startsWith("/")) return `/${s}`;
      return s;
    }),
  name: z.string(),
  type: z.string(),
  projectId: z.string(),
  uploadId: z.string(),
  file: z.file(),
});

const parseFormData = ResultAsync.fromThrowable(
  async (request: Request) => {
    const originalFormData = await request.formData();
    const formDataObj = Object.fromEntries(originalFormData.entries());
    return formDataSchema.parse(formDataObj);
  },
  (err) => {
    if (err instanceof ZodError) {
      return { kind: "ZodError" as const, cause: err };
    } else {
      return { kind: "UnknownError" as const, cause: err };
    }
  },
);

class HttpError extends Error {
  constructor(code: number, cause: unknown) {
    super(`Error occured during execution, returning http code ${code}`, {
      cause,
    });
  }
}

type Env = {
  WORKSPACE: string;
};

export async function uploadImageFileHttpHandler(request: Request, env: Env) {
  const formData = await parseFormData(request);
  if (formData.isErr()) {
    if (formData.error.kind === "ZodError") {
      return Response.json({ error: formData.error.cause.message }, { status: 400 });
    } else {
      console.error(formData.error.cause);
      return Response.json("Internal Server Error", { status: 500 });
    }
  }

  const result = await database
    .transaction(async (tx) => {
      const useCase = new UploadImageFileUseCase(tx, env);
      const result = await useCase
        .execute(formData.value)
        .orTee((e) => console.error(e))
        .mapErr((e) =>
          match(e)
            .with({ kind: "DATABASE_ERROR" }, (e) => new HttpError(500, e.kind))
            .with({ kind: "NO_ROOT_TEMPLATE" }, (e) => new HttpError(400, e.kind))
            .with({ kind: "DB_RETURNED_TOO_MANY_VALUES" }, (e) => new HttpError(500, e.kind))
            .with({ kind: "DB_RETURNED_ZERO_VALUES" }, (e) => new HttpError(500, e.kind))
            .with({ kind: "WRITE_FILE_ERROR" }, (e) => new HttpError(500, e.kind))
            .with({ kind: "INVALID_TEMPLATE_FIELD" }, (e) => new HttpError(500, e.kind))
            .exhaustive(),
        );
      return ResultUtils.unwrapOrThrow(result);
    })
    .catch((e) => {
      console.error(e);
      throw e;
    });

  console.log("Successfully uploaded", formData.value.relativePath);
  return Response.json({
    message: "File uploaded successfully",
    fileId: result.fileId,
  });
}

class UploadImageFileUseCase {
  constructor(
    private db: AppDatabase,
    private env: Env,
  ) {}

  execute(formData: z.infer<typeof formDataSchema>) {
    const writeFile = ResultAsync.fromThrowable(
      async () => {
        const fileExtension = path.extname(formData.name);
        const filePath = path.join(this.env.WORKSPACE, formData.projectId, "input_files", `${imageId}${fileExtension}`);
        const directory = path.dirname(filePath);
        if (!existsSync(directory)) {
          await mkdir(directory, { recursive: true });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        await fsWriteFile(filePath, buffer);
      },
      (err) => ({ kind: "WRITE_FILE_ERROR" as const, cause: err }),
    );

    if (!formData.relativePath.endsWith(formData.name)) {
      formData.relativePath = `${formData.relativePath}${formData.relativePath.endsWith("/") ? "" : "/"}${formData.name}`;
    }
    const file = formData.file;
    const imageId = v4();

    return DbUtils.execute(() =>
      this.db.query.inputImages.findFirst({
        where: and(
          eq(drizzleSchema.inputImages.projectId, formData.projectId),
          eq(drizzleSchema.inputImages.originalPath, formData.relativePath),
        ),
      }),
    )
      .andThen((alreadyExists) => {
        if (alreadyExists) {
          return err({ kind: "IMAGE_ALREADY_EXISTS" as const, id: alreadyExists.id });
        }
        return ok();
      })
      .andThen(() =>
        DbUtils.executeAndExpectDefined(
          () =>
            this.db.query.templates.findFirst({
              where: and(
                eq(drizzleSchema.templates.projectId, formData.projectId),
                eq(drizzleSchema.templates.isRoot, true),
              ),
              with: {
                templateFields: {
                  with: {
                    stringField: true,
                    templateOutputImageField: true,
                  },
                },
              },
            }),
          "NO_ROOT_TEMPLATE",
        ),
      )
      .andThrough(() =>
        DbUtils.execute(() =>
          this.db
            .insert(drizzleSchema.importTasks)
            .values({
              id: formData.uploadId,
            })
            .onConflictDoNothing(),
        ),
      )
      .andThen((rootTemplate) =>
        DbUtils.executeAndReturnOneRow(() =>
          this.db
            .insert(drizzleSchema.inputImages)
            .values({
              id: imageId,
              importTaskId: formData.uploadId,
              originalPath: formData.relativePath,
              originalFileName: formData.name,
              projectId: formData.projectId,
              type: formData.type,
              templateId: rootTemplate.id,
            })
            .returning(),
        ).map((insertedImage) => ({
          insertedImage,
          rootTemplate,
        })),
      )
      .andThen(({ rootTemplate, insertedImage }) => {
        const stringFieldsIds: string[] = [];
        const outputImageFieldsIds: string[] = [];
        for (const field of rootTemplate.templateFields) {
          const error = match(field)
            .with({ kind: "InputImage" }, () => void 0) //no value for this field
            .with({ kind: "String" }, (f) => {
              if (!f.stringField) {
                return {
                  kind: "INVALID_TEMPLATE_FIELD" as const,
                  cause: `In template ${rootTemplate.id}, template field ${f.fieldId} has kind ${f.kind} but string_field_id is null`,
                };
              }
              stringFieldsIds.push(f.stringField.id);
            })
            .with({ kind: "OutputImage" }, (f) => {
              if (!f.templateOutputImageField) {
                return {
                  kind: "INVALID_TEMPLATE_FIELD" as const,
                  cause: `In template ${rootTemplate.id}, template field ${f.fieldId} has kind ${f.kind} but templateOutputImageField is null`,
                };
              }
              outputImageFieldsIds.push(f.templateOutputImageField.id);
            })
            .exhaustive();
          if (error) {
            return errAsync(error);
          }
        }
        return DbUtils.executeIf(stringFieldsIds.length > 0, () =>
          this.db.insert(drizzleSchema.stringFieldValues).values(
            stringFieldsIds.map((templateFieldId) => ({
              id: v4(),
              templateFieldId: templateFieldId,
              inputImageId: insertedImage.id,
            })),
          ),
        ).andThen(() =>
          DbUtils.executeIf(outputImageFieldsIds.length > 0, () =>
            this.db.insert(drizzleSchema.outputFieldValues).values(
              outputImageFieldsIds.map((templateFieldId) => ({
                id: v4(),
                templateFieldId: templateFieldId,
                inputImageId: insertedImage.id,
              })),
            ),
          ),
        );
      })
      .andThen(() => writeFile())
      .map(() => ({ fileId: imageId }))
      .orElse((e) => {
        if (e.kind === "IMAGE_ALREADY_EXISTS") {
          return ok({ fileId: e.id });
        }
        return err(e);
      });
  }
}
