import { relations } from "drizzle-orm";
import { type AnySQLiteColumn, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { inputImage } from "./input-image";
import { project } from "./project";
import { templateField } from "./template-fields";

export const templates = sqliteTable("template", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isRoot: integer("is_root", { mode: "boolean" }).notNull().default(false),
  parentId: text("parent_id").references((): AnySQLiteColumn => templates.id),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
});

export const templatesRelations = relations(templates, (helpers) => ({
  project: helpers.one(project, {
    relationName: "template_to_project",
    fields: [templates.projectId],
    references: [project.id],
  }),
  parent: helpers.one(templates, {
    relationName: "template_to_parent_template",
    fields: [templates.parentId],
    references: [templates.id],
  }),
  children: helpers.many(templates, {
    relationName: "template_to_parent_template",
  }),
  inputImages: helpers.many(inputImage, {
    relationName: "template_to_input_image",
  }),
  fields: helpers.many(templateField, {
    relationName: "template_field_to_template",
  }),
}));
