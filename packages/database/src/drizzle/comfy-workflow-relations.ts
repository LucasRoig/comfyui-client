import { relations } from "drizzle-orm";
import { prompt } from "./prompt";
import { comfyWorkflow } from "./comfy-workflow";

export const comfyWorkflowRelations = relations(comfyWorkflow, (helpers) => ({
  prompts: helpers.many(prompt, {
    relationName: "promt_to_workflow"
  })
}))
