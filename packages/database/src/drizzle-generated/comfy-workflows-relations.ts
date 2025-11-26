import { relations } from 'drizzle-orm';
import { comfyWorkflows } from './comfy-workflows';
import { prompts } from './prompts';

export const comfyWorkflowsRelations = relations(comfyWorkflows, (helpers) => ({ prompts: helpers.many(prompts, { relationName: 'ComfyWorkflowToPrompt' }) }));