import { INITIAL_CATALOG_EXERCISES } from "@/hooks/use-exercise-catalog";
import { ExerciseCatalogListSchema, type CatalogExercise } from "@/schemas/exercise-catalog.schema";
import { mapCatalogExerciseMuscles } from "./catalog-muscles";

function loadPickableExercises(): CatalogExercise[] {
  const parsed = ExerciseCatalogListSchema.safeParse(INITIAL_CATALOG_EXERCISES);
  if (!parsed.success) {
    console.warn("[exercise-picker] Exercise catalog failed validation", parsed.error.issues);
    return [];
  }
  // Only exercises we can show on the body diagram can be logged
  return parsed.data.filter((exercise) => mapCatalogExerciseMuscles(exercise) !== null);
}

/** Validated catalog exercises that can be added to a live workout. */
export const PICKABLE_EXERCISES: readonly CatalogExercise[] = loadPickableExercises();

export function findPickableExercise(catalogExerciseId: string): CatalogExercise | null {
  return PICKABLE_EXERCISES.find((exercise) => exercise.id === catalogExerciseId) ?? null;
}
