import { z } from "zod";
import {
  CatalogExerciseIdSchema,
  PersonalRecordTypeSchema,
  RepsSchema,
  WeightKgSchema,
  WorkoutSessionIdSchema,
} from "./workout-history.schema";

/** The user's results for one catalog exercise over saved workouts (chart + "my max" tiles). */

export const MAX_PROGRESS_POINTS = 12;

/** Chart metric — the same three values the personal records use */
export const ProgressMetricSchema = PersonalRecordTypeSchema;

export const ExerciseProgressPointSchema = z.object({
  sessionId: WorkoutSessionIdSchema,
  completedAt: z.date(),
  /** Best estimated 1RM in that workout (weighted sets) */
  oneRepMaxKg: z.number().nonnegative().nullable(),
  /** Best kg × reps of one set in that workout (weighted sets) */
  bestSetVolumeKg: z.number().nonnegative().nullable(),
  /** Most reps in one bodyweight set in that workout */
  maxReps: RepsSchema.nullable(),
});

export const SetResultSchema = z.object({ weightKg: WeightKgSchema, reps: RepsSchema });

export const ExerciseProgressSummarySchema = z.object({
  /** "Twój max" — best estimated 1RM ever */
  oneRepMaxKg: z.number().nonnegative().nullable(),
  /** "Najcięższy ciężar" — heaviest set actually lifted */
  heaviestSet: SetResultSchema.nullable(),
  /** "Rekordowa seria" */
  bestSetVolume: SetResultSchema.extend({ volumeKg: z.number().nonnegative() }).nullable(),
  /** "Najwięcej powtórzeń" (bodyweight) */
  maxReps: RepsSchema.nullable(),
  workoutCount: z.number().int().nonnegative(),
});

export const ExerciseProgressSchema = z.object({
  catalogExerciseId: CatalogExerciseIdSchema,
  /** Oldest first, the last MAX_PROGRESS_POINTS workouts */
  points: z.array(ExerciseProgressPointSchema).max(MAX_PROGRESS_POINTS),
  summary: ExerciseProgressSummarySchema,
});

export const PROGRESS_METRIC_LABELS: Record<z.infer<typeof ProgressMetricSchema>, { label: string; unit: "kg" | "powt." }> = {
  one_rep_max: { label: "Max (1RM)", unit: "kg" },
  best_set_volume: { label: "Seria", unit: "kg" },
  max_reps: { label: "Powtórzenia", unit: "powt." },
};

export type ProgressMetric = z.infer<typeof ProgressMetricSchema>;
export type ExerciseProgressPoint = z.infer<typeof ExerciseProgressPointSchema>;
export type SetResult = z.infer<typeof SetResultSchema>;
export type ExerciseProgressSummary = z.infer<typeof ExerciseProgressSummarySchema>;
export type ExerciseProgress = z.infer<typeof ExerciseProgressSchema>;
