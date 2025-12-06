import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const templates = sqliteTable("template", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isRoot: integer("is_root", { mode: "boolean" }).default(false).notNull(),
  parentId: text("parent_id"),
  projectId: text("project_id").notNull(),
});
