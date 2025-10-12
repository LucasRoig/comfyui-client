import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { inputImage } from "./input-image";

export const importTask = sqliteTable("import_task", {
  id: text("id").primaryKey(),
});

export const importTaskRelations = relations(importTask, (helpers) => ({
  inputImages: helpers.many(inputImage, {
    relationName: "input_image_to_import_task",
  }),
}));
