import { toWorkoutSessionExport } from "@/lib/workout-history-mappers";
import { attachWorkoutPhoto, clearWorkoutHistory, removeWorkoutPhoto } from "@/lib/workout-photo-service";
import { workoutPhotoStorage } from "@/lib/workout-photo-storage";
import type {
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
