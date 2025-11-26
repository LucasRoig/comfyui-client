import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const templateOutputImageFields = sqliteTable('template_output_image_field', { id: text('id').primaryKey(), fieldId: text('fieldId').notNull(), parentFieldId: text('parentFieldId') });