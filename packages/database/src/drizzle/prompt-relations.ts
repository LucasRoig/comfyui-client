import { relations } from "drizzle-orm";
import { prompt } from "./prompt";
import { comfyWorkflow } from "./comfy-workflow";
import { outputImage } from "./output-image";

export const promptRelations = relations(prompt, (helpers) => ({
  comfyWorkflow: helpers.one(comfyWorkflow, {
    relationName: "promt_to_workflow",
    fields: [prompt.workflowId],
    references: [comfyWorkflow.id],
  }),
  outputImages: helpers.many(outputImage, {
    relationName: "output_image_to_prompt"
  })
}))
