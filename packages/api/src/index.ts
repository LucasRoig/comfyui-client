import { type InferRouterInputs, type InferRouterOutputs, os } from "@orpc/server";
import { createProjectProcedure } from "./use-case/project/create-project";
import { listProjectProcedure } from "./use-case/project/list-projects";
import { createChildTemplateProcedure } from "./use-case/project/template/create-child-template";
import { createRootTemplateProcedure } from "./use-case/project/template/create-root-template";
import { findRootTemplateProcedure } from "./use-case/project/template/find-root-template";
import { getTemplateByIdProcedure } from "./use-case/project/template/get-template-by-id";
import { listTemplateProcedure } from "./use-case/project/template/list-templates";
import { treeTemplateProcedure } from "./use-case/project/template/tree-template";
import { updateTemplateFieldsProcedure } from "./use-case/project/template/update-template-fields";

export { createProjectDTOSchema } from "./use-case/project/create-project";
export { uploadImageFileHttpHandler } from "./use-case/upload-image-file";

export const appRouter = os.router({
  ping: os.handler(() => "pong"),
  projects: {
    list: listProjectProcedure,
    create: createProjectProcedure,
    templates: {
      list: listTemplateProcedure,
      tree: treeTemplateProcedure,
      findRoot: findRootTemplateProcedure,
      createRoot: createRootTemplateProcedure,
      createChild: createChildTemplateProcedure,
      getById: getTemplateByIdProcedure,
      updateFields: updateTemplateFieldsProcedure,
    },
  },
});

export type RouterOutputs = InferRouterOutputs<typeof appRouter>;
export type RouterInputs = InferRouterInputs<typeof appRouter>;
