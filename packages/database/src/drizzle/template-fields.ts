import { relations } from "drizzle-orm";
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

export const templateFieldRelations = relations(templateField, (helpers) => ({
  template: helpers.one(templates, {
    relationName: "template_field_to_template",
    fields: [templateField.templateId],
    references: [templates.id],
  }),
  stringField: helpers.many(templateStringFields, {
    relationName: "template_string_field_to_template_field"
  }),
  inputImageField: helpers.many(templateInputImageFields, {
    relationName: "template_input_image_field_to_template_field"
  }),
  outputImageField: helpers.many(templateOutputImageFields, {
    relationName: "template_output_image_field_to_template_field"
  })
}));

export const templateStringFields = sqliteTable("template_string_field", {
  id: text("id").primaryKey(),

  fieldId: text("field_id")
    .notNull()
    .references(() => templateField.id),
  parentFieldId: text("parent_field_id").references((): AnySQLiteColumn => templateStringFields.id),
});

export const templateStringFieldRelations = relations(templateStringFields, (helpers) => ({
  templateField: helpers.one(templateField, {
    relationName: "template_string_field_to_template_field",
    fields: [templateStringFields.fieldId],
    references: [templateField.id],
  }),
}));

export const templateInputImageFields = sqliteTable("template_input_image_field", {
  id: text("id").primaryKey(),

  fieldId: text("field_id")
    .notNull()
    .references(() => templateField.id),
  parentFieldId: text("parent_field_id").references((): AnySQLiteColumn => templateInputImageFields.id),
});

export const templateInputImageFieldsRelations = relations(templateInputImageFields, (helpers) => ({
  templateField: helpers.one(templateField, {
    relationName: "template_input_image_field_to_template_field",
    fields: [templateInputImageFields.fieldId],
    references: [templateField.id],
  }),
}));

export const templateOutputImageFields = sqliteTable("template_output_image_field", {
  id: text("id").primaryKey(),

  fieldId: text("field_id")
    .notNull()
    .references(() => templateField.id),
  parentFieldId: text("parent_field_id").references((): AnySQLiteColumn => templateOutputImageFields.id),
});

export const templateOutputImageFieldsRelations = relations(templateOutputImageFields, (helpers) => ({
  templateField: helpers.one(templateField, {
    relationName: "template_output_image_field_to_template_field",
    fields: [templateOutputImageFields.fieldId],
    references: [templateField.id],
  }),
}));
