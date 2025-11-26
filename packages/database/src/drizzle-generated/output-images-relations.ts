import { relations } from 'drizzle-orm';
import { outputImages } from './output-images';
import { prompts } from './prompts';

export const outputImagesRelations = relations(outputImages, (helpers) => ({ prompt: helpers.one(prompts, { relationName: 'OutputImageToPrompt', fields: [ outputImages.promptId ], references: [ prompts.id ] }) }));