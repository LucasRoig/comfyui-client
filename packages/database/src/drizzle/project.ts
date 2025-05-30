import {
    sqliteTable,
    text
} from "drizzle-orm/sqlite-core";

export const project = sqliteTable("project", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
});
