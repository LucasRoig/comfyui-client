import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const templateStringFields = sqliteTable('template_string_field', { id: text('id').primaryKey(), fieldId: text('field_id').notNull(), parentFieldId: text('parent_field_id') });