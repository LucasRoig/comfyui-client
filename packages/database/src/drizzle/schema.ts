import { comfyWorkflow } from "./comfy-workflow";
import { comfyWorkflowRelations } from "./comfy-workflow-relations";
import { promptRelations } from "./prompt-relations";
import { prompt } from "./prompt";
import { outputImage } from "./output-image";
import { outputImageRelations } from "./output-image-relations";

export const schema = {
  comfyWorkflow,
  comfyWorkflowRelations,
  prompt,
  promptRelations,
  outputImage,
  outputImageRelations,
}
