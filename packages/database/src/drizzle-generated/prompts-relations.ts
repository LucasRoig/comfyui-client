import { relations } from 'drizzle-orm';
import { prompts } from './prompts';
import { comfyWorkflows } from './comfy-workflows';
import { outputImages } from './output-images';

export const promptsRelations = relations(prompts, (helpers) => ({ workflow: helpers.one(comfyWorkflows, { relationName: 'ComfyWorkflowToPrompt', fields: [ prompts.workflowId ], references: [ comfyWorkflows.id ] }), outputImages: helpers.many(outputImages, { relationName: 'OutputImageToPrompt' }) }));