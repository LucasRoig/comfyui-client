import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { eq, inArray, type SQL, sql } from "drizzle-orm";
import { ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";
import { type AppDatabase, database } from "../../../database";
import { DbUtils } from "../../../db-utils";
import { ResultUtils } from "../../../result-utils";

const dtoSchema = z.object({
  templateId: z.string(),
  fields: z.array(
    z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
  ),
});
type DTO = z.infer<typeof dtoSchema>;

export const updateTemplateFieldsProcedure = os.input(dtoSchema).handler(async ({ input }) => {
  const uc = new UpdateTemplateFieldsUseCase(database);
  const result = await uc
    .execute(input)
    .orTee((e) => console.error(e))
    .mapErr((err) =>
      match(err)
        .with({ kind: "TEMPLATE_NOT_FOUND" }, () => new ORPCError("NOT_FOUND"))
        .with({ kind: "TEMPLATE_FIELD_NOT_FOUND" }, () => new ORPCError("BAD_REQUEST"))
        .with({ kind: "DATABASE_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .exhaustive(),
    );
  return ResultUtils.unwrapOrThrow(result);
});

class UpdateTemplateFieldsUseCase {
  public constructor(private db: AppDatabase) {}

  public execute(input: DTO) {
    if (input.fields.length === 0) {
      return ok();
    }
    return DbUtils.executeAndExpectDefined(
      () =>
        this.db.query.templates.findFirst({
          where: eq(drizzleSchema.templates.id, input.templateId),
        }),
      "TEMPLATE_NOT_FOUND",
    )
      .andThen(() =>
        DbUtils.execute(() =>
          this.db.query.templateFields.findMany({
            where: inArray(
              drizzleSchema.templateFields.id,
              input.fields.map((f) => f.id),
            ),
          }),
        ).andThen((fields) => {
          if (input.fields.length !== fields.length) {
            return ResultUtils.simpleError("TEMPLATE_FIELD_NOT_FOUND");
          }
          return ok();
        }),
      )
      .map(() => {
        const xChunks: SQL[] = [];
        const yChunks: SQL[] = [];
        const widthChunks: SQL[] = [];
        const heightChunks: SQL[] = [];
        const ids: string[] = [];
        xChunks.push(sql`(case`);
        yChunks.push(sql`(case`);
        widthChunks.push(sql`(case`);
        heightChunks.push(sql`(case`);
        for (const field of input.fields) {
          xChunks.push(sql` when ${drizzleSchema.templateFields.id} = ${field.id} then ${field.x} `);
          yChunks.push(sql` when ${drizzleSchema.templateFields.id} = ${field.id} then ${field.y} `);
          widthChunks.push(sql` when ${drizzleSchema.templateFields.id} = ${field.id} then ${field.width} `);
          heightChunks.push(sql` when ${drizzleSchema.templateFields.id} = ${field.id} then ${field.height} `);
          ids.push(field.id);
        }
        xChunks.push(sql`end)`);
        yChunks.push(sql`end)`);
        widthChunks.push(sql`end)`);
        heightChunks.push(sql`end)`);
        return {
          xSql: sql.join(xChunks, sql.raw(` `)),
          ySql: sql.join(yChunks, sql.raw(` `)),
          widthSql: sql.join(widthChunks, sql.raw(` `)),
          heightSql: sql.join(heightChunks, sql.raw(` `)),
          ids,
        };
      })
      .andThen(({ xSql, ySql, widthSql, heightSql, ids }) =>
        DbUtils.execute(() =>
          this.db
            .update(drizzleSchema.templateFields)
            .set({
              x: xSql,
              y: ySql,
              width: widthSql,
              height: heightSql,
            })
            .where(inArray(drizzleSchema.templateFields.id, ids)),
        ).map(() => void 0),
      );
  }
}
