import { type InferRouterInputs, type InferRouterOutputs, os } from "@orpc/server";
import { createProjectProcedure } from "./use-case/project/create-project";
import { listProjectProcedure } from "./use-case/project/list-projects";
import { listTemplateProcedure } from "./use-case/project/template/list-templates";

export { createProjectDTOSchema } from "./use-case/project/create-project";

export const appRouter = os.router({
  ping: os.handler(() => "pong"),
  projects: {
    list: listProjectProcedure,
    create: createProjectProcedure,
    templates: {
      list: listTemplateProcedure,
    }
  },
});

export type RouterOutputs = InferRouterOutputs<typeof appRouter>;
export type RouterInputs = InferRouterInputs<typeof appRouter>;
