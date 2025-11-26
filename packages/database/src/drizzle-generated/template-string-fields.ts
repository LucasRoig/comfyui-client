import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const templateStringFields = sqliteTable('template_string_field', { id: text('id').primaryKey(), fieldId: text('fieldId').notNull(), parentFieldId: text('parentFieldId') });