import { ROUTINE_LEVEL_LABELS, type RoutineItem } from "@/schemas/routine.schema";
import type { UserRoutineCard } from "@/schemas/user-profile-screen.schema";
import type { WorkoutDetail } from "@/schemas/workout-session.schema";
import type { NewWorkoutSession, Routine } from "@/schemas/workout-history.schema";

/** Stored routines → view models, and a finished routine → a new workout session. */

function uniqueTargetMuscles(routine: Routine): string[] {
  return [...new Set(routine.exercises.map((exercise) => exercise.targetMuscle))];
}

export function toUserRoutineCard(routine: Routine): UserRoutineCard {
  return {
    id: routine.id,
    title: routine.title,
    targetMuscleGroups: uniqueTargetMuscles(routine),
    daysPerWeek: routine.daysPerWeek,
    durationMinutes: routine.durationMinutes,
    exerciseCount: routine.exercises.length,
    levelLabel: ROUTINE_LEVEL_LABELS[routine.level].label,
  };
}

export function toRoutineItem(routine: Routine): RoutineItem {
  return {
    id: routine.id,
    title: routine.title,
    description: routine.description,
    durationMinutes: routine.durationMinutes,
    daysPerWeek: routine.daysPerWeek,
    level: routine.level,
    targetMuscleGroups: uniqueTargetMuscles(routine),
    exerciseCount: routine.exercises.length,
    isPopular: false,
  };
}

export function toWorkoutDetail(routine: Routine): WorkoutDetail {
  return {
    id: routine.id,
    title: routine.title,
    description: routine.description,
    durationMinutes: routine.durationMinutes,
    level: routine.level,
    targetMuscleGroups: uniqueTargetMuscles(routine),
    exercises: routine.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      sets: exercise.sets,
      targetReps: exercise.targetReps,
      restSeconds: exercise.restSeconds,
      completed: false,
    })),
  };
}

export interface BuildNewWorkoutSessionInput {
  routine: Routine;
  completedExerciseIds: readonly string[];
  startedAt: Date;
  completedAt: Date;
}

/** Candidate for `NewWorkoutSessionSchema` — the caller validates it (e.g. "no exercise completed"). */
export function buildNewWorkoutSession({
  routine,
  completedExerciseIds,
  startedAt,
  completedAt,
}: BuildNewWorkoutSessionInput): NewWorkoutSession {
  return {
    routineId: routine.id,
    title: routine.title,
    startedAt,
    completedAt,
    exercises: routine.exercises.map((exercise) => ({
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      sets: exercise.sets,
      targetReps: exercise.targetReps,
      completed: completedExerciseIds.includes(exercise.id),
    })),
  };
}
