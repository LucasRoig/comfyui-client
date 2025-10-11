import { comfyWorkflow } from "./comfy-workflow";
import { comfyWorkflowRelations } from "./comfy-workflow-relations";
import { inputImage, inputImageRelations } from "./input-image";
import { outputImage } from "./output-image";
import { outputImageRelations } from "./output-image-relations";
import { project, projectRelations } from "./project";
import { prompt } from "./prompt";
import { promptRelations } from "./prompt-relations";

export const schema = {
  comfyWorkflow,
  comfyWorkflowRelations,
  prompt,
  promptRelations,
  outputImage,
  outputImageRelations,
  project,
  projectRelations,
  inputImage,
  inputImageRelations,
};
