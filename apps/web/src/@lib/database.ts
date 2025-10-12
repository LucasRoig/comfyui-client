import { type Client, createClient } from "@libsql/client";
import { drizzleSchema } from "@repo/database";
import { Mutex } from "async-mutex";
import { drizzle } from "drizzle-orm/libsql";

declare global {
  var sqliteClient: Client | undefined;
  var drizzleClient: ReturnType<typeof drizzle<typeof drizzleSchema>> | undefined;
  var $transactionMutex: Mutex | undefined;
}

const sClient = globalThis.sqliteClient || createClient({ url: process.env.DATABASE_URL! });
globalThis.sqliteClient = sClient;

const db = globalThis.drizzleClient || drizzle(sClient, { schema: drizzleSchema });
globalThis.drizzleClient = db;

const transactionMutex = globalThis.$transactionMutex || new Mutex();
globalThis.$transactionMutex = transactionMutex;

export const database = new Proxy(db, {
  get: (target, prop, receiver) => {
    if (prop === "transaction") {
      // Use a mutex to synchronize transactions. SQLite doesn't support concurrent transactions
      return async (...args: Parameters<typeof db.transaction>) => {
        const release = await transactionMutex.acquire();
        try {
          return await target.transaction(...args);
        } finally {
          release();
        }
      };
    }
    return Reflect.get(target, prop, receiver);
  },
});
