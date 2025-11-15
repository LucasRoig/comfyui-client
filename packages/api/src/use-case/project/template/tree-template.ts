import { ORPCError, os } from "@orpc/server";
import { ok } from "neverthrow";
import { match } from "ts-pattern";
import z from "zod";
import { database } from "../../../database";
import { ResultUtils } from "../../../result-utils";
import { ListTemplatesUseCase } from "./list-templates";

const dtoSchema = z.object({
  projectId: z.string().min(1),
});

export type Tree<T> = {
  value: T;
  children: Tree<T>[];
};

export const treeTemplateProcedure = os.input(dtoSchema).handler(async ({ input }) => {
  const uc = new TreeTemplateUseCase(new ListTemplatesUseCase(database));
  const result = await uc
    .execute(input)
    .orTee((e) => console.error(e))
    .mapErr((err) =>
      match(err)
        .with({ kind: "DATABASE_ERROR" }, () => new ORPCError("INTERNAL_SERVER_ERROR"))
        .with({ kind: "NO_ROOT_FOUND" }, () => new ORPCError("INTERNAL_SERVER_ERROR")),
    );
  return ResultUtils.unwrapOrThrow(result);
});

class TreeTemplateUseCase {
  public constructor(private listTemplateUseCase: ListTemplatesUseCase) {}

  public execute(input: z.infer<typeof dtoSchema>) {
    return this.listTemplateUseCase.execute(input).andThen((templateList) => {
      if (templateList.length === 0) {
        return ok("EMPTY_TEMPLATE_LIST" as const);
      }
      const rootTemplate = templateList.find((t) => t.isRoot);
      if (rootTemplate === undefined) {
        return ResultUtils.simpleError("NO_ROOT_FOUND");
      }

      const templatesByParent = Map.groupBy(templateList, (t) => t.parentId);

      function makeTree(root: (typeof templateList)[number]): Tree<(typeof templateList)[number]> {
        const children = templatesByParent.get(root.id);
        if (children && children.length > 0) {
          return {
            value: root,
            children: children.map((c) => makeTree(c)),
          };
        } else {
          return {
            value: root,
            children: [],
          };
        }
      }
      return ok(makeTree(rootTemplate));
    });
  }
}
