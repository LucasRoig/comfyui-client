import { relations } from 'drizzle-orm';
import { templates } from './templates';
import { projects } from './projects';
import { inputImages } from './input-images';
import { templateFields } from './template-fields';

export const templatesRelations = relations(templates, (helpers) => ({ parent: helpers.one(templates, { relationName: 'TemplateToTemplate', fields: [ templates.parentId ], references: [ templates.id ] }), children: helpers.many(templates, { relationName: 'TemplateToTemplate' }), project: helpers.one(projects, { relationName: 'ProjectToTemplate', fields: [ templates.projectId ], references: [ projects.id ] }), inputImages: helpers.many(inputImages, { relationName: 'InputImageToTemplate' }), templateFields: helpers.many(templateFields, { relationName: 'TemplateToTemplateField' }) }));