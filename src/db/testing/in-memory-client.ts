import type * as client from "../client";
import { createOnboardingRepository } from "../repositories/onboarding.repository";
import { createRoutineRepository } from "../repositories/routine.repository";
import { createWorkoutSessionRepository } from "../repositories/workout-session.repository";
import { seedDatabase } from "../seed";
import type { AppDatabase } from "../types";
import { createTestDatabase, type TestDatabase } from "./create-test-database";

/**
 * Drop-in replacement for `src/db/client.ts` backed by in-memory SQLite with the real migrations and seed.
 * Test-only: `jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"))`.
 */

let testDatabase: TestDatabase | null = null;
let initialization: Promise<AppDatabase> | null = null;

export const DATABASE_NAME: typeof client.DATABASE_NAME = "aitrainer.db";

export function initializeDatabase(): Promise<AppDatabase> {
  if (!initialization) {
    initialization = (async () => {
      testDatabase = createTestDatabase();
      await seedDatabase(testDatabase.db);
      return testDatabase.db;
    })();
  }
  return initialization;
}

export async function openOnboardingRepository() {
  return createOnboardingRepository(await initializeDatabase());
}

export async function openRoutineRepository() {
  return createRoutineRepository(await initializeDatabase());
}

export async function openWorkoutSessionRepository() {
  return createWorkoutSessionRepository(await initializeDatabase());
}

/** Closes the database; the next open starts from a fresh, seeded one. Call in `afterEach`. */
export function resetInMemoryDatabase(): void {
  testDatabase?.close();
  testDatabase = null;
  initialization = null;
}

// Compile-time guard: the fake must stay interchangeable with the real client
const clientParity: typeof client = {
  DATABASE_NAME,
  initializeDatabase,
  openOnboardingRepository,
  openRoutineRepository,
  openWorkoutSessionRepository,
};
void clientParity;

/** Workout sessions belong to a profile (FK), so tests that save workouts create the local user first. */
export async function saveLocalProfile(): Promise<void> {
  await (await openOnboardingRepository()).save({
    name: "Kacper",
    experienceLevel: "beginner",
    fitnessGoal: "strength",
    muscleFocus: { mode: "undecided" },
  });
}
