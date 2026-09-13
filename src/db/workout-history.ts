import { toWorkoutSessionExport } from "@/lib/workout-history-mappers";
import { attachWorkoutPhoto, clearWorkoutHistory, removeWorkoutPhoto } from "@/lib/workout-photo-service";
import { workoutPhotoStorage } from "@/lib/workout-photo-storage";
import type { ExerciseProgress } from "@/schemas/exercise-progress.schema";
import type { PersonalBest } from "@/schemas/live-workout.schema";
import type {
  CatalogExerciseId,
  NewUserRoutine,
  NewWorkoutSession,
  Routine,
  WorkoutHistoryEntry,
  WorkoutSession,
  WorkoutSessionExport,
  WorkoutSessionId,
} from "@/schemas/workout-history.schema";
import { openRoutineRepository, openWorkoutSessionRepository } from "./client";

/**
 * App-facing entry point for routines and workout history.
 * Hooks call these functions and never touch repositories, SQLite or the file system directly.
 */

export async function loadRoutines(): Promise<Routine[]> {
  return (await openRoutineRepository()).list();
}

export async function loadWorkoutHistory(): Promise<WorkoutHistoryEntry[]> {
  const sessions = await (await openWorkoutSessionRepository()).list();
  return sessions.map((session) => ({
    ...session,
    photoUri: session.photoFileName ? workoutPhotoStorage.resolveUri(session.photoFileName) : null,
  }));
}

export async function saveWorkoutSession(session: NewWorkoutSession): Promise<WorkoutSession> {
  return (await openWorkoutSessionRepository()).save(session);
}

export async function loadPersonalBests(catalogExerciseIds: readonly CatalogExerciseId[]): Promise<PersonalBest[]> {
  return (await openWorkoutSessionRepository()).getPersonalBests(catalogExerciseIds);
}

export async function loadExerciseProgress(catalogExerciseId: CatalogExerciseId): Promise<ExerciseProgress> {
  return (await openWorkoutSessionRepository()).getExerciseProgress(catalogExerciseId);
}

export interface SaveLiveWorkoutInput {
  session: NewWorkoutSession;
  /** null = the user did not ask to save the workout as a routine */
  routine: NewUserRoutine | null;
  /** Temporary picker URI; null = no photo */
  photoUri: string | null;
}

export interface SaveLiveWorkoutResult {
  session: WorkoutSession;
  routineSaved: boolean;
  photoSaved: boolean;
}

/**
 * Saves a finished empty workout. The workout itself must succeed (rejects otherwise);
 * the optional routine and photo are best effort, so a failing extra never loses the training data.
 */
export async function saveLiveWorkout({ session, routine, photoUri }: SaveLiveWorkoutInput): Promise<SaveLiveWorkoutResult> {
  const saved = await saveWorkoutSession(session);

  let routineSaved = false;
  if (routine) {
    try {
      await (await openRoutineRepository()).create(routine);
      routineSaved = true;
    } catch (error: unknown) {
      console.error("[db] Failed to save the workout as a routine", error);
    }
  }

  let photoSaved = false;
  if (photoUri) {
    try {
      await attachPhotoToWorkout(saved.id, photoUri);
      photoSaved = true;
    } catch (error: unknown) {
      console.error("[photos] Failed to attach the photo to the saved workout", error);
    }
  }

  return { session: saved, routineSaved, photoSaved };
}

export async function attachPhotoToWorkout(sessionId: WorkoutSessionId, sourceUri: string): Promise<void> {
  const repository = await openWorkoutSessionRepository();
  await attachWorkoutPhoto({ repository, storage: workoutPhotoStorage, sessionId, sourceUri });
}

export async function removePhotoFromWorkout(sessionId: WorkoutSessionId): Promise<void> {
  const repository = await openWorkoutSessionRepository();
  await removeWorkoutPhoto({ repository, storage: workoutPhotoStorage, sessionId });
}

export async function exportWorkoutSessions(): Promise<WorkoutSessionExport[]> {
  const sessions = await (await openWorkoutSessionRepository()).list();
  return sessions.map(toWorkoutSessionExport);
}

export async function deleteWorkoutHistory(): Promise<void> {
  const repository = await openWorkoutSessionRepository();
  await clearWorkoutHistory({ repository, storage: workoutPhotoStorage });
}
