import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const outputFieldValues = sqliteTable('output_field_value', { id: text('id').primaryKey(), outputImageId: text('output_image_id'), templateFieldId: text('template_field_id').notNull(), inputImageId: text('input_image_id').notNull() });