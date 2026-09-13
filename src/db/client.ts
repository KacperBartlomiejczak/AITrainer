import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "../../drizzle/migrations";
import {
  createOnboardingRepository,
  type OnboardingRepository,
} from "./repositories/onboarding.repository";
import * as schema from "./schema";
import type { AppDatabase } from "./types";

export const DATABASE_NAME = "aitrainer.db";

let initialization: Promise<AppDatabase> | null = null;

async function openAndMigrate(): Promise<AppDatabase> {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  expoDb.execSync("PRAGMA foreign_keys = ON;");
  const db = drizzle(expoDb, { schema });
  await migrate(db, migrations);
  return db;
}

/** Opens the on-device database and applies pending migrations (once per app run). */
export function initializeDatabase(): Promise<AppDatabase> {
  if (!initialization) {
    initialization = openAndMigrate().catch((error: unknown) => {
      initialization = null; // allow a retry on the next call
      throw error;
    });
  }
  return initialization;
}

export async function openOnboardingRepository(): Promise<OnboardingRepository> {
  return createOnboardingRepository(await initializeDatabase());
}
