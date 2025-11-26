export { schema as drizzleSchema } from "./drizzle-generated/schema";

import { LibSQLDatabase } from "drizzle-orm/libsql";
import { schema } from "./drizzle-generated/schema";

type DB = LibSQLDatabase<typeof schema>;
type AppTransaction = Parameters<Parameters<DB["transaction"]>[0]>[0];
export type AppDatabase = DB | AppTransaction;
