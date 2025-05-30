import { createClient } from "@libsql/client";
import { drizzleSchema } from "@repo/database";
import { drizzle } from "drizzle-orm/libsql/node";

const client = createClient({ url: process.env.DATABASE_URL! });
export const database = drizzle(client, {
  schema: drizzleSchema,
});
