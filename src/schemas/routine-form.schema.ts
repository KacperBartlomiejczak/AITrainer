import { z } from "zod";
import { RoutineLevelSchema } from "./routine.schema";
import { MAX_SETS_PER_EXERCISE } from "./workout-history.schema";

/** "Stwórz nową rutynę": exercises picked from the catalog, sets/reps/rest still editable. */

export const MAX_ROUTINE_EXERCISES = 20;
export const ROUTINE_TITLE_MAX_LENGTH = 80;
export const ROUTINE_DESCRIPTION_MAX_LENGTH = 240;
export const DEFAULT_ROUTINE_REST_SECONDS = 90;
export const DEFAULT_ROUTINE_TARGET_REPS = "8-12";
export const DEFAULT_ROUTINE_SETS = 3;

export const RoutineDraftExerciseSchema = z.object({
  /** Client-side row id, stable across re-renders while editing */
  id: z.string().min(1),
  catalogExerciseId: z.string().min(1),
  name: z.string().min(1),
  targetMuscle: z.string().min(1),
  sets: z.number().int().positive().max(MAX_SETS_PER_EXERCISE),
  targetReps: z.string().trim().min(1).max(40),
  restSeconds: z.number().int().nonnegative().max(900),
});

export const RoutineDraftSchema = z.object({
  title: z.string().trim().min(1).max(ROUTINE_TITLE_MAX_LENGTH),
  description: z.string().trim().min(1).max(ROUTINE_DESCRIPTION_MAX_LENGTH),
  level: RoutineLevelSchema,
  daysPerWeek: z.number().int().min(1).max(7),
  durationMinutes: z.number().int().positive().max(600),
  exercises: z.array(RoutineDraftExerciseSchema).min(1).max(MAX_ROUTINE_EXERCISES),
});

export type RoutineDraftExercise = z.infer<typeof RoutineDraftExerciseSchema>;
export type RoutineDraft = z.infer<typeof RoutineDraftSchema>;
