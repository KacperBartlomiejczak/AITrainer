import { ROUTINE_LEVEL_LABELS, type RoutineItem } from "@/schemas/routine.schema";
import type { RoutineDraft } from "@/schemas/routine-form.schema";
import type { UserRoutineCard } from "@/schemas/user-profile-screen.schema";
import type { WorkoutDetail } from "@/schemas/workout-session.schema";
import type { NewUserRoutine, NewWorkoutSession, Routine } from "@/schemas/workout-history.schema";

/** Stored routines → view models, a finished routine → a new workout session, and a draft → a routine to save. */

type CreateId = (prefix: string) => string;

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
    isUserCreated: routine.userId !== null,
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

/** Candidate for `NewUserRoutineSchema` — the caller validates it. */
export function buildRoutineFromDraft(draft: RoutineDraft, createId: CreateId): NewUserRoutine {
  return {
    id: createId("rtn"),
    title: draft.title,
    description: draft.description,
    level: draft.level,
    daysPerWeek: draft.daysPerWeek,
    durationMinutes: draft.durationMinutes,
    exercises: draft.exercises.map((exercise) => ({
      id: createId("rtx"),
      name: exercise.name,
      targetMuscle: exercise.targetMuscle,
      sets: exercise.sets,
      targetReps: exercise.targetReps,
      restSeconds: exercise.restSeconds,
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
