import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import * as schema from "../schema";
import type { AppDatabase } from "../types";

const MIGRATIONS_FOLDER = path.join(__dirname, "../../../drizzle");

export interface TestDatabase {
  db: AppDatabase;
  /** Raw client for simulating corrupted rows that bypass Drizzle/Zod. */
  sqlite: Database.Database;
  close: () => void;
}

/** In-memory SQLite with the real app migrations applied. Test-only. */
export function createTestDatabase(): TestDatabase {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return { db, sqlite, close: () => sqlite.close() };
}
