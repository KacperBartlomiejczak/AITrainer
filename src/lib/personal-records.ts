import type {
  LiveWorkoutExercise,
  LiveWorkoutSet,
  PersonalBest,
  PersonalRecordHits,
} from "@/schemas/live-workout.schema";
import type { PersonalRecordType, SetTag } from "@/schemas/workout-history.schema";

/**
 * Single source of truth for personal records — used live on the workout screen and by the repository.
 * one_rep_max / best_set_volume: weighted sets (kg > 0), max_reps: bodyweight sets (0 kg).
 */

type SetResult = { weightKg: number; reps: number };
type HistorySet = SetResult & { tag: SetTag | null };

/** Warm-ups and failed sets never count as a personal record (neither as a record nor as the bar to beat) */
export const TAGS_EXCLUDED_FROM_RECORDS: readonly SetTag[] = ["warmup", "failed"];

const WEIGHTED_RECORD_TYPES = ["one_rep_max", "best_set_volume"] as const satisfies readonly PersonalRecordType[];
const BODYWEIGHT_RECORD_TYPES = ["max_reps"] as const satisfies readonly PersonalRecordType[];

/** Rounded so that float noise (70 × 10/30 vs 80 × 5/30) never creates a fake record */
const roundForComparison = (value: number) => Math.round(value * 100) / 100;

const countsForRecords = (tag: SetTag | null) => !tag || !TAGS_EXCLUDED_FROM_RECORDS.includes(tag);

/** Epley: kg × (1 + reps / 30); a single rep is the lifted weight itself. */
export function estimateOneRepMaxKg(weightKg: number, reps: number): number {
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30);
}

/** Heavier weight wins; at the same weight more reps win (used for the "top set" summary). */
export function isBetterSet(candidate: SetResult, best: SetResult): boolean {
  return candidate.weightKg > best.weightKg || (candidate.weightKg === best.weightKg && candidate.reps > best.reps);
}

function recordValue(type: PersonalRecordType, { weightKg, reps }: SetResult): number {
  switch (type) {
    case "one_rep_max":
      return roundForComparison(estimateOneRepMaxKg(weightKg, reps));
    case "best_set_volume":
      return roundForComparison(weightKg * reps);
    case "max_reps":
      return reps;
  }
}

function recordTypesFor(set: SetResult): readonly PersonalRecordType[] {
  return set.weightKg > 0 ? WEIGHTED_RECORD_TYPES : BODYWEIGHT_RECORD_TYPES;
}

function bestValueOf(best: PersonalBest, type: PersonalRecordType): number | null {
  const value = { one_rep_max: best.oneRepMaxKg, best_set_volume: best.bestSetVolumeKg, max_reps: best.maxReps }[type];
  return value === null ? null : roundForComparison(value);
}

/** Bests from stored sets; null = nothing in the history counts yet (so nothing can be beaten). */
export function computePersonalBest(catalogExerciseId: string, sets: readonly HistorySet[]): PersonalBest | null {
  const counted = sets.filter((set) => countsForRecords(set.tag));
  if (counted.length === 0) return null;

  const maxOf = (type: PersonalRecordType) => {
    const values = counted.filter((set) => recordTypesFor(set).includes(type)).map((set) => recordValue(type, set));
    return values.length > 0 ? Math.max(...values) : null;
  };
  return {
    catalogExerciseId,
    oneRepMaxKg: maxOf("one_rep_max"),
    bestSetVolumeKg: maxOf("best_set_volume"),
    maxReps: maxOf("max_reps"),
  };
}

function toCountedResult(set: LiveWorkoutSet): SetResult | null {
  if (!set.isCompleted || set.reps === null || !countsForRecords(set.tag)) return null;
  return { weightKg: set.weightKg ?? 0, reps: set.reps };
}

/**
 * Which live sets beat the stored bests — per catalog exercise at most one set per record type
 * (strictly better than the history; on a tie inside the workout the earlier set keeps it).
 */
export function findPersonalRecordHits(
  exercises: readonly LiveWorkoutExercise[],
  personalBests: readonly PersonalBest[],
): PersonalRecordHits {
  const bestsByExercise = new Map(personalBests.map((best) => [best.catalogExerciseId, best]));
  // catalogExerciseId → record type → best set in this workout
  const leaders = new Map<string, Map<PersonalRecordType, { setId: string; value: number }>>();

  for (const exercise of exercises) {
    if (!bestsByExercise.has(exercise.catalogExerciseId)) continue;
    const exerciseLeaders = leaders.get(exercise.catalogExerciseId) ?? new Map();
    leaders.set(exercise.catalogExerciseId, exerciseLeaders);

    for (const set of exercise.sets) {
      const result = toCountedResult(set);
      if (!result) continue;
      for (const type of recordTypesFor(result)) {
        const value = recordValue(type, result);
        const leader = exerciseLeaders.get(type);
        if (!leader || value > leader.value) exerciseLeaders.set(type, { setId: set.id, value });
      }
    }
  }

  const hits = new Map<string, PersonalRecordType[]>();
  for (const [catalogExerciseId, exerciseLeaders] of leaders) {
    const history = bestsByExercise.get(catalogExerciseId);
    if (!history) continue;
    for (const [type, leader] of exerciseLeaders) {
      const bar = bestValueOf(history, type);
      if (bar !== null && leader.value > bar) {
        hits.set(leader.setId, [...(hits.get(leader.setId) ?? []), type]);
      }
    }
  }

  // Stable order of badges: MAX, SERIA, POWT.
  const order: readonly PersonalRecordType[] = [...WEIGHTED_RECORD_TYPES, ...BODYWEIGHT_RECORD_TYPES];
  for (const [setId, types] of hits) {
    hits.set(setId, [...types].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  }
  return hits;
}

export function countPersonalRecords(hits: PersonalRecordHits): number {
  let count = 0;
  for (const types of hits.values()) count += types.length;
  return count;
}
