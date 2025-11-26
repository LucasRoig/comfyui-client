import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const prompts = sqliteTable('prompt', { id: text('id').primaryKey(), json: text('json', { mode: 'json' }).notNull(), workflowId: text('workflowId').notNull() });