import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const outputImages = sqliteTable('output_image', { id: text('id').primaryKey(), filename: text('filename').notNull(), relativePath: text('relativePath').notNull(), promptId: text('promptId').notNull(), nodeId: text('nodeId').notNull() });