import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";
import { type AppDatabase, database } from "../../../database";
import { DbUtils } from "../../../db-utils";
import { ResultUtils } from "../../../result-utils";

const dtoSchema = z.object({
  templateId: z.string(),
});
type DTO = z.infer<typeof dtoSchema>;

export const getTemplateByIdProcedure = os.input(dtoSchema).handler(async ({ input }) => {
  const uc = new GetTemplateByIdUseCase(database);
  const result = await uc
    .execute(input)
    .orTee((e) => console.error(e))
    .mapErr((err) =>
      match(err)
        .with({ kind: "TEMPLATE_NOT_FOUND" }, () => new ORPCError("NOT_FOUND"))
        .with({ kind: "DATABASE_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .exhaustive(),
    );
  return ResultUtils.unwrapOrThrow(result);
});

class GetTemplateByIdUseCase {
  public constructor(private db: AppDatabase) {}

  public execute(input: DTO) {
    return DbUtils.executeAndExpectDefined(
      () =>
        this.db.query.templates.findFirst({
          where: eq(drizzleSchema.templates.id, input.templateId),
          with: {
            templateFields: {
              with: {
                templateInputImageFields: true,
                templateOutputImageField: true,
                stringField: true,
              },
            },
          },
        }),
      "TEMPLATE_NOT_FOUND",
    );
  }
}
