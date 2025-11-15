import { comfyWorkflow } from "./comfy-workflow";
import { comfyWorkflowRelations } from "./comfy-workflow-relations";
import { importTask, importTaskRelations } from "./import-task";
import { inputImage, inputImageRelations } from "./input-image";
import { outputImage } from "./output-image";
import { outputImageRelations } from "./output-image-relations";
import { project, projectRelations } from "./project";
import { prompt } from "./prompt";
import { promptRelations } from "./prompt-relations";
import { templateField, templateInputImageFields, templateOutputImageFields, templateStringFields } from "./template-fields";
import { templates, templatesRelations } from "./templates";

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
  importTask,
  importTaskRelations,
  templates,
  templatesRelations,
  templateField,
  templateStringFields,
  templateInputImageFields,
  templateOutputImageFields
};
