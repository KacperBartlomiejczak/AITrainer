import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "../../drizzle/migrations";
import {
  createOnboardingRepository,
  type OnboardingRepository,
} from "./repositories/onboarding.repository";
import { createRoutineRepository, type RoutineRepository } from "./repositories/routine.repository";
import {
  createWorkoutSessionRepository,
  type WorkoutSessionRepository,
} from "./repositories/workout-session.repository";
import * as schema from "./schema";
import { seedDatabase } from "./seed";
import type { AppDatabase } from "./types";

export const DATABASE_NAME = "aitrainer.db";

let initialization: Promise<AppDatabase> | null = null;

async function openAndMigrate(): Promise<AppDatabase> {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  expoDb.execSync("PRAGMA foreign_keys = ON;");
  const db = drizzle(expoDb, { schema });
  await migrate(db, migrations);
  await seedDatabase(db);
  return db;
}

/** Opens the on-device database, applies pending migrations and seeds built-in data (once per app run). */
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

export async function openRoutineRepository(): Promise<RoutineRepository> {
  return createRoutineRepository(await initializeDatabase());
}

export async function openWorkoutSessionRepository(): Promise<WorkoutSessionRepository> {
  return createWorkoutSessionRepository(await initializeDatabase());
}
