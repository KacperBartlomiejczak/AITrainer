import { z } from "zod";
import { ExerciseEquipmentFilterSchema } from "./exercise-catalog.schema";
import { RankingMuscleGroupSchema } from "./ranking.schema";

/** Filters of the "Dodaj ćwiczenie" list in the live workout. */

// 7 muscle groups — the same as on the body diagram and in the ranking
export const PickerMuscleFilterSchema = z.union([z.literal("all"), RankingMuscleGroupSchema]);

// Only the equipment types the user trains with most (kettlebell / bands stay under "all")
export const PickerEquipmentFilterSchema = ExerciseEquipmentFilterSchema.extract([
  "all",
  "machine",
  "bodyweight",
  "barbell",
  "dumbbell",
]);

export const PICKER_QUERY_MAX_LENGTH = 60;

export const ExercisePickerFiltersSchema = z.object({
  muscle: PickerMuscleFilterSchema,
  equipment: PickerEquipmentFilterSchema,
  query: z.string().max(PICKER_QUERY_MAX_LENGTH),
});

export interface FilterOption<T extends string> {
  id: T;
  label: string;
  emoji: string;
}

export type PickerMuscleFilter = z.infer<typeof PickerMuscleFilterSchema>;
export type PickerEquipmentFilter = z.infer<typeof PickerEquipmentFilterSchema>;
export type ExercisePickerFilters = z.infer<typeof ExercisePickerFiltersSchema>;

export const DEFAULT_PICKER_FILTERS: ExercisePickerFilters = { muscle: "all", equipment: "all", query: "" };

export const PICKER_MUSCLE_OPTIONS: readonly FilterOption<PickerMuscleFilter>[] = [
  { id: "all", label: "Wszystkie", emoji: "🏋️" },
  { id: "chest", label: "Klatka", emoji: "🫁" },
  { id: "back", label: "Plecy", emoji: "🔙" },
  { id: "legs", label: "Nogi", emoji: "🦵" },
  { id: "shoulders", label: "Barki", emoji: "🤸" },
  { id: "biceps", label: "Biceps", emoji: "💪" },
  { id: "triceps", label: "Triceps", emoji: "🦾" },
  { id: "abs", label: "Brzuch", emoji: "🎯" },
];

export const PICKER_EQUIPMENT_OPTIONS: readonly FilterOption<PickerEquipmentFilter>[] = [
  { id: "all", label: "Każdy sprzęt", emoji: "🧰" },
  { id: "machine", label: "Maszyna", emoji: "⚙️" },
  { id: "bodyweight", label: "Masa własna", emoji: "🤸" },
  { id: "barbell", label: "Sztanga", emoji: "🏋️‍♂️" },
  { id: "dumbbell", label: "Hantle", emoji: "🔩" },
];
