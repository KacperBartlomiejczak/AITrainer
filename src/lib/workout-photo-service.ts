import type { WorkoutSessionRepository } from "@/db/repositories/workout-session.repository";
import type { WorkoutSessionId } from "@/schemas/workout-history.schema";
import type { WorkoutPhotoStorage } from "./workout-photo-storage";

/**
 * Keeps photo files and `workout_sessions.photo_file_name` consistent.
 * Dependencies are injected so the ordering and rollback rules are unit-testable.
 */

interface PhotoDependencies {
  repository: Pick<WorkoutSessionRepository, "setPhoto">;
  storage: WorkoutPhotoStorage;
}

function removeQuietly(storage: WorkoutPhotoStorage, fileName: string): void {
  try {
    storage.remove(fileName);
  } catch (error: unknown) {
    // An orphaned file is harmless; the database already points at the right photo
    console.error("[photos] Failed to delete a workout photo file", error);
  }
}

export async function attachWorkoutPhoto({
  repository,
  storage,
  sessionId,
  sourceUri,
}: PhotoDependencies & { sessionId: WorkoutSessionId; sourceUri: string }): Promise<void> {
  const fileName = await storage.save(sourceUri, sessionId);

  let previousFileName: string | null;
  try {
    previousFileName = await repository.setPhoto(sessionId, fileName);
  } catch (error: unknown) {
    removeQuietly(storage, fileName);
    throw error;
  }

  if (previousFileName && previousFileName !== fileName) {
    removeQuietly(storage, previousFileName);
  }
}

export async function removeWorkoutPhoto({
  repository,
  storage,
  sessionId,
}: PhotoDependencies & { sessionId: WorkoutSessionId }): Promise<void> {
  const previousFileName = await repository.setPhoto(sessionId, null);
  if (previousFileName) {
    removeQuietly(storage, previousFileName);
  }
}

export async function clearWorkoutHistory({
  repository,
  storage,
}: {
  repository: Pick<WorkoutSessionRepository, "clearAll">;
  storage: WorkoutPhotoStorage;
}): Promise<void> {
  try {
    await repository.clearAll();
  } finally {
    // Photos are sensitive: delete the files even if the database is unavailable
    storage.removeAll();
  }
}
