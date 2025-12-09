import { ORPCError, os } from "@orpc/server";
import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import { match } from "ts-pattern";
import z from "zod";
import { type AppDatabase, database } from "@/database";
import { DbUtils } from "@/db-utils";
import { ResultUtils } from "@/result-utils";

const inputRequestSchema = z.object({
  projectId: z.string(),
});
type InputRequest = z.infer<typeof inputRequestSchema>;

export const listFilesProcedure = os.input(inputRequestSchema).handler(async ({ input }) => {
  const uc = new ListFilesUseCase(database);
  const result = (await uc.execute(input))
    .orTee((e) => console.error(e))
    .mapErr((err) =>
      match(err)
        .with({ kind: "DATABASE_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .exhaustive(),
    );
  return ResultUtils.unwrapOrThrow(result);
});

class ListFilesUseCase {
  public constructor(private db: AppDatabase) { }

  public async execute(input: InputRequest) {
    return DbUtils.execute(() =>
      this.db.query.inputImages.findMany({
        where: eq(drizzleSchema.inputImages.projectId, input.projectId),
      }),
    );
  }
}
