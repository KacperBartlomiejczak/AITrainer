import type {
  CompletedWorkoutDetail,
  RoutinePhotoItem,
} from "@/schemas/user-profile-screen.schema";
import type { RecentActivity } from "@/schemas/workout.schema";
import type {
  WorkoutHistoryEntry,
  WorkoutSession,
  WorkoutSessionExerciseRow,
  WorkoutSessionExport,
} from "@/schemas/workout-history.schema";
import { formatDurationMinutes, formatWorkoutDateLabel } from "./workout-date-label";

/** Stored workout sessions → view models for the home and profile screens. */

function pluralizeSets(count: number): string {
  if (count === 1) return "seria";
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14) ? "serie" : "serii";
}

export function formatSetsSummary(
  exercise: Pick<WorkoutSessionExerciseRow, "sets" | "targetReps" | "completed">,
): string {
  if (!exercise.completed) return "Pominięte";
  return `${exercise.sets} ${pluralizeSets(exercise.sets)} × ${exercise.targetReps}`;
}

function uniqueTargetMuscles(session: WorkoutSession): string[] {
  return [...new Set(session.exercises.map((exercise) => exercise.targetMuscle))];
}

function countCompleted(session: WorkoutSession): number {
  return session.exercises.filter((exercise) => exercise.completed).length;
}

export function toCompletedWorkoutDetail(entry: WorkoutHistoryEntry, now: Date): CompletedWorkoutDetail {
  return {
    id: entry.id,
    title: entry.title,
    subtitle: uniqueTargetMuscles(entry).join(", "),
    completedDate: formatWorkoutDateLabel(entry.completedAt, now),
    durationMinutes: formatDurationMinutes(entry.durationSeconds),
    completedExerciseCount: countCompleted(entry),
    photoUri: entry.photoUri,
    exercises: entry.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      setsSummary: formatSetsSummary(exercise),
      completed: exercise.completed,
      isPersonalRecord: false,
    })),
    // Achievements need logged weights/reps, which are not tracked yet
    achievements: [],
  };
}

/** Top carousel item — only workouts that have a photo. */
export function toRoutinePhotoItem(workout: CompletedWorkoutDetail): RoutinePhotoItem | null {
  if (!workout.photoUri) return null;
  return {
    id: workout.id,
    title: workout.title,
    subtitle: workout.subtitle || "Trening siłowy",
    photoUri: workout.photoUri,
    completedDate: workout.completedDate,
    durationMinutes: workout.durationMinutes,
    exercises: workout.exercises,
  };
}

export function toRecentActivity(entry: WorkoutHistoryEntry, now: Date): RecentActivity {
  return {
    id: entry.id,
    title: entry.title,
    completedAt: formatWorkoutDateLabel(entry.completedAt, now),
    durationMinutes: formatDurationMinutes(entry.durationSeconds),
    completedExerciseCount: countCompleted(entry),
    totalExerciseCount: entry.exercises.length,
    photoUri: entry.photoUri,
  };
}

export function toWorkoutSessionExport(session: WorkoutSession): WorkoutSessionExport {
  return {
    id: session.id,
    routineId: session.routineId,
    title: session.title,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt.toISOString(),
    durationSeconds: session.durationSeconds,
    hasPhoto: session.photoFileName !== null,
    exercises: session.exercises.map(({ name, targetMuscle, sets, targetReps, completed }) => ({
      name,
      targetMuscle,
      sets,
      targetReps,
      completed,
    })),
  };
}
