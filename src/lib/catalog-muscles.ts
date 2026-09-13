import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import type { RankingMuscleGroup } from "@/schemas/ranking.schema";

/** Catalog muscle names (ExerciseDB vocabulary) → the 7 muscle groups shown on the body diagram. */
const CATALOG_MUSCLE_TO_RANKING_GROUP: Readonly<Record<string, RankingMuscleGroup>> = {
  pectorals: "chest",
  chest: "chest",
  lats: "back",
  "upper back": "back",
  "lower back": "back",
  trapezius: "back",
  rhomboids: "back",
  quadriceps: "legs",
  hamstrings: "legs",
  glutes: "legs",
  calves: "legs",
  "hip flexors": "legs",
  delts: "shoulders",
  "rear delts": "shoulders",
  shoulders: "shoulders",
  biceps: "biceps",
  brachialis: "biceps",
  triceps: "triceps",
  abs: "abs",
  obliques: "abs",
  core: "abs",
};

/** Fallback when the primary muscle is unknown */
const BODY_PART_TO_RANKING_GROUP: Readonly<Record<string, RankingMuscleGroup>> = {
  chest: "chest",
  back: "back",
  "upper legs": "legs",
  "lower legs": "legs",
  shoulders: "shoulders",
  waist: "abs",
};

export function mapCatalogMuscleToRankingGroup(muscle: string): RankingMuscleGroup | null {
  return CATALOG_MUSCLE_TO_RANKING_GROUP[muscle.trim().toLowerCase()] ?? null;
}

export interface ExerciseRankingMuscles {
  primaryMuscles: RankingMuscleGroup[];
  secondaryMuscles: RankingMuscleGroup[];
}

/** null = the exercise cannot be shown on the body diagram (no known muscle group). */
export function mapCatalogExerciseMuscles(
  exercise: Pick<CatalogExercise, "muscleGroup" | "bodyPart" | "secondaryMuscles">,
): ExerciseRankingMuscles | null {
  const primary =
    mapCatalogMuscleToRankingGroup(exercise.muscleGroup) ?? BODY_PART_TO_RANKING_GROUP[exercise.bodyPart] ?? null;
  if (!primary) return null;

  const secondaryMuscles = [
    ...new Set(
      exercise.secondaryMuscles.flatMap((muscle) => {
        const group = mapCatalogMuscleToRankingGroup(muscle);
        return group && group !== primary ? [group] : [];
      }),
    ),
  ];
  return { primaryMuscles: [primary], secondaryMuscles };
}
