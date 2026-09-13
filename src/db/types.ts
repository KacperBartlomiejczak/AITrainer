import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "./schema";

/**
 * Driver-agnostic Drizzle database used by repositories.
 * Expo SQLite in the app, better-sqlite3 (in-memory) in tests — both are sync drivers.
 */
export type AppDatabase = BaseSQLiteDatabase<"sync", unknown, typeof schema>;
