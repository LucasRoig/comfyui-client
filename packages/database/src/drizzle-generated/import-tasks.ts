import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const importTasks = sqliteTable('import_task', { id: text('id').primaryKey() });