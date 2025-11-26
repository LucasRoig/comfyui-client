import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const templates = sqliteTable('template', { id: text('id').primaryKey(), name: text('name').notNull(), isRoot: integer('isRoot', { mode: 'boolean' }).default(false).notNull(), parentId: text('parentId'), projectId: text('projectId').notNull() });