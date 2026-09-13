import {
  ExerciseCategoryFilterSchema,
  ExerciseEquipmentFilterSchema,
  ExerciseFilterStateSchema,
  EQUIPMENT_FILTER_OPTIONS,
  CatalogExerciseSchema,
  ExerciseCatalogListSchema,
} from "../exercise-catalog.schema";

describe("exercise-catalog.schema", () => {
  it("validates exercise category filters", () => {
    expect(ExerciseCategoryFilterSchema.safeParse("all").success).toBe(true);
    expect(ExerciseCategoryFilterSchema.safeParse("waist").success).toBe(true);
    expect(ExerciseCategoryFilterSchema.safeParse("chest").success).toBe(true);
    expect(ExerciseCategoryFilterSchema.safeParse("invalid").success).toBe(false);
  });

  it("validates exercise equipment filters", () => {
    expect(ExerciseEquipmentFilterSchema.safeParse("all").success).toBe(true);
    expect(ExerciseEquipmentFilterSchema.safeParse("dumbbell").success).toBe(true);
    expect(ExerciseEquipmentFilterSchema.safeParse("barbell").success).toBe(true);
    expect(ExerciseEquipmentFilterSchema.safeParse("bodyweight").success).toBe(true);
    expect(ExerciseEquipmentFilterSchema.safeParse("kettlebell").success).toBe(true);
    expect(ExerciseEquipmentFilterSchema.safeParse("machine").success).toBe(true);
    expect(ExerciseEquipmentFilterSchema.safeParse("band").success).toBe(true);
    expect(ExerciseEquipmentFilterSchema.safeParse("unknown_eq").success).toBe(false);
  });

  it("validates combined exercise filter state", () => {
    const validState = {
      category: "chest",
      equipment: "dumbbell",
      searchQuery: "wyciskanie",
    };
    expect(ExerciseFilterStateSchema.safeParse(validState).success).toBe(true);

    const invalidState = {
      category: "invalid_category",
      equipment: "dumbbell",
      searchQuery: "",
    };
    expect(ExerciseFilterStateSchema.safeParse(invalidState).success).toBe(false);
  });

  it("contains all equipment filter options with valid ids", () => {
    expect(EQUIPMENT_FILTER_OPTIONS.length).toBeGreaterThanOrEqual(6);
    EQUIPMENT_FILTER_OPTIONS.forEach((opt) => {
      expect(ExerciseEquipmentFilterSchema.safeParse(opt.id).success).toBe(true);
      expect(opt.label.length).toBeGreaterThan(0);
      expect(opt.emoji.length).toBeGreaterThan(0);
    });
  });

  it("validates valid catalog exercise item", () => {
    const exercise = {
      id: "0001",
      name: "3/4 sit-up (Brzuszki)",
      bodyPart: "waist",
      category: "waist",
      target: "abs",
      equipment: "body weight",
      instructionsPl: "Połóż się płasko na plecach, ugnij kolana...",
      imageFile: "images/0001-2gPfomN.jpg",
      gifFile: "videos/0001-2gPfomN.gif",
    };
    const parsed = CatalogExerciseSchema.safeParse(exercise);
    expect(parsed.success).toBe(true);
  });

  it("fails if required fields are missing", () => {
    const incomplete = {
      id: "0001",
      name: "Brzuszki",
    };
    const parsed = CatalogExerciseSchema.safeParse(incomplete);
    expect(parsed.success).toBe(false);
  });

  it("validates list of exercises", () => {
    const list = [
      {
        id: "0001",
        name: "3/4 sit-up",
        bodyPart: "waist",
        category: "waist",
        target: "abs",
        equipment: "body weight",
        instructionsPl: "Instrukcja po polsku",
        imageFile: "images/0001-2gPfomN.jpg",
        gifFile: "videos/0001-2gPfomN.gif",
      },
    ];
    expect(ExerciseCatalogListSchema.safeParse(list).success).toBe(true);
  });
});

