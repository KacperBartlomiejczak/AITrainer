import { createRoutineRepository } from "./repositories/routine.repository";
import { BUILTIN_ROUTINES } from "./seeds/builtin-routines";
import type { AppDatabase } from "./types";

/** Inserts built-in data that is missing. Never rejects: the app works without the seed. */
export async function seedDatabase(db: AppDatabase): Promise<void> {
  try {
    await createRoutineRepository(db).seed(BUILTIN_ROUTINES);
  } catch (error: unknown) {
    console.error("[db] Failed to seed built-in routines", error);
  }
}
