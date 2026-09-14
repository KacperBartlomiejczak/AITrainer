import { useCallback, useEffect, useMemo, useState } from "react";
import { loadExerciseProgress } from "@/db/workout-history";
import { getProgressValue } from "@/lib/exercise-progress";
import { findPickableExercise } from "@/lib/pickable-exercises";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import {
  ProgressMetricSchema,
  type ExerciseProgress,
  type ProgressMetric,
} from "@/schemas/exercise-progress.schema";

export interface ProgressSheetTarget {
  catalogExerciseId: string;
  name: string;
}

export type ProgressSheetStatus = "idle" | "loading" | "ready" | "error";

interface LoadedProgress {
  catalogExerciseId: string;
  progress: ExerciseProgress | null;
}

/** Bottom sheet opened from an exercise card: saved progress (chart + max) and the technique preview. */
export function useExerciseProgressSheet() {
  const [target, setTarget] = useState<ProgressSheetTarget | null>(null);
  const [loaded, setLoaded] = useState<LoadedProgress | null>(null);
  const [selectedMetric, setMetric] = useState<ProgressMetric | null>(null);
  const [techniqueExercise, setTechniqueExercise] = useState<CatalogExercise | null>(null);
  const targetId = target?.catalogExerciseId ?? null;

  useEffect(() => {
    if (targetId === null) return;
    let isCurrent = true;
    loadExerciseProgress(targetId)
      .then((progress) => {
        if (isCurrent) setLoaded({ catalogExerciseId: targetId, progress });
      })
      .catch((error: unknown) => {
        console.error("[db] Failed to load exercise progress", error);
        if (isCurrent) setLoaded({ catalogExerciseId: targetId, progress: null });
      });
    return () => {
      isCurrent = false;
    };
  }, [targetId]);

  const isLoadedForTarget = targetId !== null && loaded?.catalogExerciseId === targetId;
  const progress = isLoadedForTarget ? loaded.progress : null;
  const status: ProgressSheetStatus =
    targetId === null ? "idle" : !isLoadedForTarget ? "loading" : progress ? "ready" : "error";

  // Only metrics with at least one value can be charted (e.g. reps for bodyweight exercises)
  const availableMetrics = useMemo(
    () =>
      ProgressMetricSchema.options.filter((metric) =>
        (progress?.points ?? []).some((point) => getProgressValue(point, metric) !== null),
      ),
    [progress],
  );
  const metric: ProgressMetric =
    selectedMetric && availableMetrics.includes(selectedMetric) ? selectedMetric : (availableMetrics[0] ?? "one_rep_max");

  const open = useCallback((nextTarget: ProgressSheetTarget) => {
    setMetric(null);
    setTarget(nextTarget);
  }, []);

  const close = useCallback(() => {
    setTechniqueExercise(null);
    setTarget(null);
    // Next opening loads fresh data (e.g. after saving a workout), never shows the old results
    setLoaded(null);
  }, []);

  const showTechnique = useCallback(() => {
    if (targetId) setTechniqueExercise(findPickableExercise(targetId));
  }, [targetId]);
  const closeTechnique = useCallback(() => setTechniqueExercise(null), []);

  return {
    target,
    status,
    progress,
    availableMetrics,
    metric,
    setMetric,
    open,
    close,
    techniqueExercise,
    showTechnique,
    closeTechnique,
  };
}

export type ExerciseProgressSheetController = ReturnType<typeof useExerciseProgressSheet>;
