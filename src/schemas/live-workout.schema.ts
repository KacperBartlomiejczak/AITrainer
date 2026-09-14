import { z } from "zod";
import { RankingMuscleGroupSchema } from "./ranking.schema";
import {
  CatalogExerciseIdSchema,
  MAX_SETS_PER_EXERCISE,
  RepsSchema,
  SetTagSchema,
  WeightKgSchema,
  type PersonalRecordType,
  type SetTag,
} from "./workout-history.schema";

/**
 * The "empty workout" the user builds while training: exercises picked from the catalog,
 * sets logged on the fly. Lives in the active-session store until it is saved.
 */

export const MAX_LIVE_WORKOUT_EXERCISES = 30;
export const WORKOUT_TITLE_MAX_LENGTH = 120;

// ── Set tags (R / D / NU) ─────────────────────────────────────
export interface SetTagMeta {
  short: "R" | "D" | "NU";
  label: string;
  color: string;
}

export const SET_TAG_META: Record<SetTag, SetTagMeta> = {
  warmup: { short: "R", label: "Rozgrzewka", color: "#F59E0B" },
  drop_set: { short: "D", label: "Drop set", color: "#A855F7" },
  failed: { short: "NU", label: "Nieudana", color: "#F87171" },
};

// ── Session state ─────────────────────────────────────────────
const LiveEntityIdSchema = z.string().min(1).max(64);

export const LiveWorkoutSetSchema = z.object({
  id: LiveEntityIdSchema,
  /** null = not typed in yet */
  weightKg: WeightKgSchema.nullable(),
  reps: RepsSchema.nullable(),
  tag: SetTagSchema.nullable(),
  isCompleted: z.boolean(),
});

export const LiveWorkoutExerciseSchema = z.object({
  id: LiveEntityIdSchema,
  catalogExerciseId: CatalogExerciseIdSchema,
  name: z.string().trim().min(1).max(120),
  targetMuscle: z.string().trim().min(1).max(120),
  primaryMuscles: z.array(RankingMuscleGroupSchema).min(1),
  secondaryMuscles: z.array(RankingMuscleGroupSchema),
  sets: z.array(LiveWorkoutSetSchema).min(1).max(MAX_SETS_PER_EXERCISE),
});

export const LiveWorkoutSessionSchema = z.object({
  /** Epoch ms */
  startedAt: z.number().int().positive(),
  exercises: z.array(LiveWorkoutExerciseSchema).max(MAX_LIVE_WORKOUT_EXERCISES),
});

/** Editable fields of a set (what the user types or ticks). */
export const LiveWorkoutSetPatchSchema = LiveWorkoutSetSchema.pick({
  weightKg: true,
  reps: true,
  tag: true,
  isCompleted: true,
}).partial();

// ── Text inputs (shared by the set row and validation) ────────
/** "62,5" or "62.5" → 62.5; anything else → invalid */
export const WeightTextSchema = z
  .string()
  .trim()
  .regex(/^\d{1,4}([.,]\d{1,2})?$/, "Podaj ciężar w kg")
  .transform((value) => Number(value.replace(",", ".")))
  .pipe(WeightKgSchema);

export const RepsTextSchema = z
  .string()
  .trim()
  .regex(/^\d{1,3}$/, "Podaj liczbę powtórzeń")
  .transform(Number)
  .pipe(RepsSchema);

// ── Personal records ──────────────────────────────────────────
export interface PersonalRecordMeta {
  short: "MAX" | "SERIA" | "POWT.";
  label: string;
  color: string;
}

export const PERSONAL_RECORD_META: Record<PersonalRecordType, PersonalRecordMeta> = {
  one_rep_max: { short: "MAX", label: "Max (1RM)", color: "#F59E0B" },
  best_set_volume: { short: "SERIA", label: "Rekordowa seria", color: "#22C55E" },
  max_reps: { short: "POWT.", label: "Najwięcej powtórzeń", color: "#38BDF8" },
};

/** The user's stored bests for one catalog exercise; null = no set of that kind in the history yet. */
export const PersonalBestSchema = z.object({
  catalogExerciseId: CatalogExerciseIdSchema,
  oneRepMaxKg: z.number().nonnegative().nullable(),
  bestSetVolumeKg: z.number().nonnegative().nullable(),
  maxReps: RepsSchema.nullable(),
});

// ── Stats shown above the workout ─────────────────────────────
export const TrainedMuscleSchema = z.object({
  muscle: RankingMuscleGroupSchema,
  intensity: z.enum(["primary", "secondary"]),
});

export const LiveWorkoutStatsSchema = z.object({
  completedSetCount: z.number().int().nonnegative(),
  totalVolumeKg: z.number().nonnegative(),
  trainedMuscles: z.array(TrainedMuscleSchema),
});

// ── Finish (confirmation) form ────────────────────────────────
export const FinishWorkoutFormSchema = z.object({
  /** Empty = a default title is generated */
  title: z.string().trim().max(WORKOUT_TITLE_MAX_LENGTH, "Nazwa treningu jest za długa"),
  saveAsRoutine: z.boolean(),
  /** Temporary picker URI; the file is copied only when the workout is saved */
  photoUri: z.string().min(1).nullable(),
});

// ── Types ─────────────────────────────────────────────────────
export type LiveWorkoutSet = z.infer<typeof LiveWorkoutSetSchema>;
export type LiveWorkoutExercise = z.infer<typeof LiveWorkoutExerciseSchema>;
export type LiveWorkoutSession = z.infer<typeof LiveWorkoutSessionSchema>;
export type LiveWorkoutSetPatch = z.infer<typeof LiveWorkoutSetPatchSchema>;
export type PersonalBest = z.infer<typeof PersonalBestSchema>;
/** Record types each live set beats (sets without a record are absent) */
export type PersonalRecordHits = ReadonlyMap<string, readonly PersonalRecordType[]>;
export type TrainedMuscle = z.infer<typeof TrainedMuscleSchema>;
export type LiveWorkoutStats = z.infer<typeof LiveWorkoutStatsSchema>;
export type FinishWorkoutForm = z.infer<typeof FinishWorkoutFormSchema>;
