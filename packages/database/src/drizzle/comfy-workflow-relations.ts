import { relations } from "drizzle-orm";
import { comfyWorkflow } from "./comfy-workflow";
import { prompt } from "./prompt";

export const comfyWorkflowRelations = relations(comfyWorkflow, (helpers) => ({
  prompts: helpers.many(prompt, {
    relationName: "promt_to_workflow",
  }),
}));
