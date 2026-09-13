import {
  MAX_PROGRESS_POINTS,
  type ExerciseProgress,
  type ExerciseProgressPoint,
  type ExerciseProgressSummary,
  type ProgressMetric,
} from "@/schemas/exercise-progress.schema";
import type { SetTag } from "@/schemas/workout-history.schema";
import { computePersonalBest, isBetterSet, TAGS_EXCLUDED_FROM_RECORDS } from "./personal-records";

/** Stored sets of one exercise in one saved workout */
export interface ProgressSessionSets {
  sessionId: string;
  completedAt: Date;
  sets: readonly { weightKg: number; reps: number; tag: SetTag | null }[];
}

type CountedSet = { weightKg: number; reps: number };

function summarize(sets: readonly CountedSet[], workoutCount: number, oneRepMaxKg: number | null): ExerciseProgressSummary {
  const weighted = sets.filter((set) => set.weightKg > 0);
  const heaviestSet = weighted.reduce<CountedSet | null>((top, set) => (!top || isBetterSet(set, top) ? set : top), null);
  const bestSetVolume = weighted.reduce<CountedSet | null>(
    (top, set) => (!top || set.weightKg * set.reps > top.weightKg * top.reps ? set : top),
    null,
  );
  const bodyweightReps = sets.filter((set) => set.weightKg === 0).map((set) => set.reps);

  return {
    oneRepMaxKg,
    heaviestSet: heaviestSet && { weightKg: heaviestSet.weightKg, reps: heaviestSet.reps },
    bestSetVolume: bestSetVolume && {
      weightKg: bestSetVolume.weightKg,
      reps: bestSetVolume.reps,
      volumeKg: bestSetVolume.weightKg * bestSetVolume.reps,
    },
    maxReps: bodyweightReps.length > 0 ? Math.max(...bodyweightReps) : null,
    workoutCount,
  };
}

/** Chart points (one per workout, oldest first) and the all-time summary; the same rules as personal records. */
export function buildExerciseProgress(
  catalogExerciseId: string,
  sessions: readonly ProgressSessionSets[],
): ExerciseProgress {
  const points: ExerciseProgressPoint[] = [...sessions]
    .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime())
    .flatMap(({ sessionId, completedAt, sets }) => {
      const best = computePersonalBest(catalogExerciseId, sets);
      return best
        ? [{ sessionId, completedAt, oneRepMaxKg: best.oneRepMaxKg, bestSetVolumeKg: best.bestSetVolumeKg, maxReps: best.maxReps }]
        : [];
    });

  const countedSets = sessions.flatMap((session) =>
    session.sets.filter((set) => !set.tag || !TAGS_EXCLUDED_FROM_RECORDS.includes(set.tag)),
  );
  const oneRepMaxValues = points.flatMap((point) => (point.oneRepMaxKg === null ? [] : [point.oneRepMaxKg]));

  return {
    catalogExerciseId,
    points: points.slice(-MAX_PROGRESS_POINTS),
    summary: summarize(countedSets, points.length, oneRepMaxValues.length > 0 ? Math.max(...oneRepMaxValues) : null),
  };
}

export function getProgressValue(point: ExerciseProgressPoint, metric: ProgressMetric): number | null {
  return { one_rep_max: point.oneRepMaxKg, best_set_volume: point.bestSetVolumeKg, max_reps: point.maxReps }[metric];
}
