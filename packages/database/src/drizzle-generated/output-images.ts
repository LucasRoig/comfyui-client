import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const outputImages = sqliteTable('output_image', { id: text('id').primaryKey(), filename: text('filename').notNull(), relativePath: text('relative_path').notNull(), promptId: text('prompt_id').notNull(), nodeId: text('node_id').notNull() });