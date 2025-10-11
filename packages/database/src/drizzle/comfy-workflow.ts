import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const comfyWorkflow = sqliteTable("comfy_workflow", {
  id: text("id").primaryKey(),
  json: text("json", { mode: "json" }),
});
