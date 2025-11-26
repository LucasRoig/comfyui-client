import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const templateInputImageFields = sqliteTable('template_input_image_field', { id: text('id').primaryKey(), fieldId: text('fieldId').notNull(), parentFieldId: text('parentFieldId') });