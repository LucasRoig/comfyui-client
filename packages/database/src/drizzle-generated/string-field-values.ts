import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const stringFieldValues = sqliteTable('string_field_value', { id: text('id').primaryKey(), value: text('value').default('').notNull(), templateFieldId: text('template_field_id').notNull(), inputImageId: text('input_image_id').notNull() });