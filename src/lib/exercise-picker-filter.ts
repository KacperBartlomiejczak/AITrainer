import { matchesEquipment } from "@/hooks/use-exercise-catalog";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import type { ExercisePickerFilters } from "@/schemas/exercise-picker.schema";
import { mapCatalogExerciseMuscles } from "./catalog-muscles";

/** "Wyciąg" and "wyciag" should match the same exercise */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .trim();
}

/** Muscle group (primary muscle, as on the body diagram) AND equipment AND search phrase. */
export function filterPickerExercises(
  exercises: readonly CatalogExercise[],
  { muscle, equipment, query }: ExercisePickerFilters,
): CatalogExercise[] {
  const normalizedQuery = normalizeSearchText(query);

  return exercises.filter((exercise) => {
    if (muscle !== "all" && !mapCatalogExerciseMuscles(exercise)?.primaryMuscles.includes(muscle)) return false;
    if (!matchesEquipment(exercise.equipment, equipment)) return false;
    return (
      !normalizedQuery ||
      normalizeSearchText(`${exercise.name} ${exercise.target} ${exercise.equipment}`).includes(normalizedQuery)
    );
  });
}
