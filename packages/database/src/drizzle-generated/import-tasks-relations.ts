import { relations } from 'drizzle-orm';
import { importTasks } from './import-tasks';
import { inputImages } from './input-images';

export const importTasksRelations = relations(importTasks, (helpers) => ({ InputImage: helpers.many(inputImages, { relationName: 'ImportTaskToInputImage' }) }));