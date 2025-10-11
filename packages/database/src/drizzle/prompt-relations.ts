import { relations } from "drizzle-orm";
import { comfyWorkflow } from "./comfy-workflow";
import { outputImage } from "./output-image";
import { prompt } from "./prompt";

export const promptRelations = relations(prompt, (helpers) => ({
  comfyWorkflow: helpers.one(comfyWorkflow, {
    relationName: "promt_to_workflow",
    fields: [prompt.workflowId],
    references: [comfyWorkflow.id],
  }),
  outputImages: helpers.many(outputImage, {
    relationName: "output_image_to_prompt",
  }),
}));
