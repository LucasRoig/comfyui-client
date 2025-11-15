import { type AnySQLiteColumn, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { templates } from "./templates";

export const templateField = sqliteTable("template_field", {
  id: text("id").primaryKey(),
  fieldId: text("field_id").notNull(),
  fieldLabel: text("field_label").notNull(),
  position: text("position").notNull(),

  templateId: text("template_id")
    .notNull()
    .references(() => templates.id),
});

export const templateStringFields = sqliteTable("template_string_field", {
  id: text("id").primaryKey(),

  fieldId: text("field_id")
    .notNull()
    .references(() => templateField.id),
  parentFieldId: text("parent_field_id").references((): AnySQLiteColumn => templateStringFields.id),
});

export const templateInputImageFields = sqliteTable("template_input_image_field", {
  id: text("id").primaryKey(),

  fieldId: text("field_id")
    .notNull()
    .references(() => templateField.id),
  parentFieldId: text("parent_field_id").references((): AnySQLiteColumn => templateInputImageFields.id),
});

export const templateOutputImageFields = sqliteTable("template_output_image_field", {
  id: text("id").primaryKey(),

  fieldId: text("field_id")
    .notNull()
    .references(() => templateField.id),
  parentFieldId: text("parent_field_id").references((): AnySQLiteColumn => templateOutputImageFields.id),
});
