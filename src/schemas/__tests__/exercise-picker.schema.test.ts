import { RankingMuscleGroupSchema } from "../ranking.schema";
import {
  DEFAULT_PICKER_FILTERS,
  ExercisePickerFiltersSchema,
  PICKER_EQUIPMENT_OPTIONS,
  PICKER_MUSCLE_OPTIONS,
  PickerEquipmentFilterSchema,
  PickerMuscleFilterSchema,
} from "../exercise-picker.schema";

describe("exercise picker filters", () => {
  it("offers all 7 body diagram muscle groups plus 'all'", () => {
    expect(PICKER_MUSCLE_OPTIONS.map((option) => option.id)).toEqual(["all", ...[
      "chest",
      "back",
      "legs",
      "shoulders",
      "biceps",
      "triceps",
      "abs",
    ]]);
    for (const muscle of RankingMuscleGroupSchema.options) {
      expect(PickerMuscleFilterSchema.safeParse(muscle).success).toBe(true);
    }
  });

  it("offers machine, bodyweight, barbell and dumbbells only", () => {
    expect(PICKER_EQUIPMENT_OPTIONS.map((option) => option.id)).toEqual([
      "all",
      "machine",
      "bodyweight",
      "barbell",
      "dumbbell",
    ]);
    expect(PickerEquipmentFilterSchema.safeParse("kettlebell").success).toBe(false);
  });

  it("validates the whole filter state and caps the search phrase", () => {
    expect(ExercisePickerFiltersSchema.safeParse(DEFAULT_PICKER_FILTERS).success).toBe(true);
    expect(ExercisePickerFiltersSchema.safeParse({ ...DEFAULT_PICKER_FILTERS, muscle: "upper arms" }).success).toBe(false);
    expect(ExercisePickerFiltersSchema.safeParse({ ...DEFAULT_PICKER_FILTERS, query: "a".repeat(61) }).success).toBe(false);
  });
});
