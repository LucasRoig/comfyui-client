import { relations } from 'drizzle-orm';
import { inputImages } from './input-images';
import { projects } from './projects';
import { importTasks } from './import-tasks';
import { templates } from './templates';

export const inputImagesRelations = relations(inputImages, (helpers) => ({ project: helpers.one(projects, { relationName: 'InputImageToProject', fields: [ inputImages.projectId ], references: [ projects.id ] }), importTask: helpers.one(importTasks, { relationName: 'ImportTaskToInputImage', fields: [ inputImages.importTaskId ], references: [ importTasks.id ] }), template: helpers.one(templates, { relationName: 'InputImageToTemplate', fields: [ inputImages.templateId ], references: [ templates.id ] }) }));