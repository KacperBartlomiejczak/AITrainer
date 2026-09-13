import { useCallback, useState } from "react";
import { findPickableExercise } from "@/lib/pickable-exercises";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

/** "How to do it" preview for an exercise already in the workout (opened from its card). */
export function useExercisePreview() {
  const [previewExercise, setPreviewExercise] = useState<CatalogExercise | null>(null);

  const openPreview = useCallback((catalogExerciseId: string) => {
    const exercise = findPickableExercise(catalogExerciseId);
    if (exercise) setPreviewExercise(exercise);
  }, []);

  const closePreview = useCallback(() => setPreviewExercise(null), []);

  return { previewExercise, openPreview, closePreview };
}

export type ExercisePreviewController = ReturnType<typeof useExercisePreview>;
