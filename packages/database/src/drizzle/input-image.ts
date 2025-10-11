import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { project } from "./project";

export const inputImage = sqliteTable("input_image", {
  id: text("id").primaryKey(),
  originalFileName: text("original_file_name").notNull(),
  originalDirectory: text("original_directory").notNull(),

  projectId: text("project_id").notNull(),
});

export const inputImageRelations = relations(inputImage, (helpers) => ({
  project: helpers.one(project, {
    relationName: "input_image_to_project",
    fields: [inputImage.projectId],
    references: [project.id],
  }),
}));
