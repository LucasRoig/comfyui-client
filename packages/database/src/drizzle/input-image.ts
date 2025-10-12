import { relations } from "drizzle-orm";
import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { importTask } from "./import-task";
import { project } from "./project";

export const inputImage = sqliteTable(
  "input_image",
  {
    id: text("id").primaryKey(),
    originalFileName: text("original_file_name").notNull(),
    originalPath: text("original_path").notNull(),
    type: text("type").notNull(),

    projectId: text("project_id")
      .notNull()
      .references(() => project.id),
    importTaskId: text("import_task_id")
      .notNull()
      .references(() => importTask.id),
  },
  (t) => [unique().on(t.projectId, t.originalPath)],
);

export const inputImageRelations = relations(inputImage, (helpers) => ({
  project: helpers.one(project, {
    relationName: "input_image_to_project",
    fields: [inputImage.projectId],
    references: [project.id],
  }),
  importTask: helpers.one(importTask, {
    relationName: "input_image_to_import_task",
    fields: [inputImage.importTaskId],
    references: [importTask.id],
  }),
}));
