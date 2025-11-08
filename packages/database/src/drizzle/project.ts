import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { inputImage } from "./input-image";
import { templates } from "./templates";

export const project = sqliteTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const projectRelations = relations(project, (helpers) => ({
  inputImage: helpers.many(inputImage, {
    relationName: "input_image_to_project",
  }),
  templates: helpers.many(templates, {
    relationName: "project_to_templates",
  }),
}));
