import { relations } from "drizzle-orm";
import { prompt } from "./prompt";
import { outputImage } from "./output-image";

export const outputImageRelations = relations(outputImage, (helpers) => ({
  prompt: helpers.one(prompt, {
    relationName: "output_image_to_prompt",
    fields: [outputImage.promptId],
    references: [prompt.id],
  })
}))
