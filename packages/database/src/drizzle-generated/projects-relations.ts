import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { inputImages } from './input-images';
import { templates } from './templates';

export const projectsRelations = relations(projects, (helpers) => ({ InputImage: helpers.many(inputImages, { relationName: 'InputImageToProject' }), templates: helpers.many(templates, { relationName: 'ProjectToTemplate' }) }));