import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const prompt = sqliteTable("prompt", {
  id: text("id").primaryKey(),
  json: text("json", { mode: "json" }),
  workflowId: text("workflow_id").notNull(),
});
