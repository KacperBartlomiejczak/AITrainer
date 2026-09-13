import { INITIAL_CATALOG_EXERCISES } from "@/hooks/use-exercise-catalog";
import {
  DEFAULT_PICKER_FILTERS,
  PICKER_EQUIPMENT_OPTIONS,
  PICKER_MUSCLE_OPTIONS,
} from "@/schemas/exercise-picker.schema";
import { mapCatalogExerciseMuscles } from "../catalog-muscles";
import { filterPickerExercises, normalizeSearchText } from "../exercise-picker-filter";

const catalog = INITIAL_CATALOG_EXERCISES;
const names = (filters: Partial<typeof DEFAULT_PICKER_FILTERS>) =>
  filterPickerExercises(catalog, { ...DEFAULT_PICKER_FILTERS, ...filters }).map((exercise) => exercise.name);

describe("normalizeSearchText", () => {
  it("ignores case, spaces around and Polish diacritics", () => {
    expect(normalizeSearchText("  Wyciąg ŁAWKA Żółć ")).toBe("wyciag lawka zolc");
  });
});

describe("filterPickerExercises", () => {
  it("returns every exercise without filters", () => {
    expect(filterPickerExercises(catalog, DEFAULT_PICKER_FILTERS)).toHaveLength(catalog.length);
  });

  it("finds exercises for every muscle group and every equipment option", () => {
    for (const { id } of PICKER_MUSCLE_OPTIONS) {
      expect(names({ muscle: id }).length).toBeGreaterThan(0);
    }
    for (const { id } of PICKER_EQUIPMENT_OPTIONS) {
      expect(names({ equipment: id }).length).toBeGreaterThan(0);
    }
  });

  it("filters by the primary muscle group of the exercise", () => {
    const tricepsExercises = filterPickerExercises(catalog, { ...DEFAULT_PICKER_FILTERS, muscle: "triceps" });
    expect(tricepsExercises.every((exercise) => mapCatalogExerciseMuscles(exercise)?.primaryMuscles.includes("triceps"))).toBe(true);
    expect(names({ muscle: "legs" })).toContain("Przysiad ze sztangą (Full Squat)");
    expect(names({ muscle: "legs" })).not.toContain("Wyciskanie sztangi na ławce poziomej");
  });

  it("filters by equipment, counting pull-up bars and dips as bodyweight and cables as machines", () => {
    expect(names({ equipment: "barbell" })).toContain("Przysiad ze sztangą (Full Squat)");
    expect(names({ equipment: "barbell" })).not.toContain("Pompki szerokim rozstawem rąk");
    expect(names({ equipment: "bodyweight" })).toContain("Pompki szerokim rozstawem rąk");
    const cableExercise = catalog.find((exercise) => exercise.equipment === "Wyciąg");
    expect(names({ equipment: "machine" })).toContain(cableExercise?.name);
  });

  it("combines muscle group, equipment and the search phrase", () => {
    expect(names({ muscle: "legs", equipment: "barbell", query: "przysiad" })).toEqual(["Przysiad ze sztangą (Full Squat)"]);
    expect(names({ muscle: "chest", equipment: "barbell", query: "przysiad" })).toEqual([]);
  });

  it("searches name, target and equipment without Polish diacritics", () => {
    expect(names({ query: "wyciag" }).length).toBeGreaterThan(0);
    expect(names({ query: "MARTWY" })).toContain("Martwy ciąg");
  });
});
