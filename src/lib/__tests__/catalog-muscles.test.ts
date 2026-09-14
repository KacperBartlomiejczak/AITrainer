import { INITIAL_CATALOG_EXERCISES } from "@/hooks/use-exercise-catalog";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import { mapCatalogExerciseMuscles, mapCatalogMuscleToRankingGroup } from "../catalog-muscles";

const benchPress: CatalogExercise = {
  id: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  bodyPart: "chest",
  category: "chest",
  target: "Klatka piersiowa",
  equipment: "Sztanga",
  muscleGroup: "pectorals",
  secondaryMuscles: ["shoulders", "triceps"],
  instructionsPl: "Opis",
  imageFile: "images/0025.jpg",
  gifFile: "videos/0025.gif",
};

describe("mapCatalogMuscleToRankingGroup", () => {
  it.each([
    ["pectorals", "chest"],
    ["chest", "chest"],
    ["lats", "back"],
    ["upper back", "back"],
    ["lower back", "back"],
    ["trapezius", "back"],
    ["rhomboids", "back"],
    ["quadriceps", "legs"],
    ["hamstrings", "legs"],
    ["glutes", "legs"],
    ["calves", "legs"],
    ["hip flexors", "legs"],
    ["delts", "shoulders"],
    ["rear delts", "shoulders"],
    ["shoulders", "shoulders"],
    ["biceps", "biceps"],
    ["brachialis", "biceps"],
    ["triceps", "triceps"],
    ["abs", "abs"],
    ["obliques", "abs"],
    ["core", "abs"],
  ])("maps %s to %s", (muscle, group) => {
    expect(mapCatalogMuscleToRankingGroup(muscle)).toBe(group);
  });

  it("returns null for muscles outside the 7 ranking groups", () => {
    expect(mapCatalogMuscleToRankingGroup("forearms")).toBeNull();
    expect(mapCatalogMuscleToRankingGroup("other")).toBeNull();
  });
});

describe("mapCatalogExerciseMuscles", () => {
  it("splits primary and secondary groups without duplicates", () => {
    expect(mapCatalogExerciseMuscles(benchPress)).toEqual({
      primaryMuscles: ["chest"],
      secondaryMuscles: ["shoulders", "triceps"],
    });
    expect(
      mapCatalogExerciseMuscles({ ...benchPress, secondaryMuscles: ["chest", "forearms", "triceps", "triceps"] }),
    ).toEqual({ primaryMuscles: ["chest"], secondaryMuscles: ["triceps"] });
  });

  it("falls back to the body part when the muscle group is unknown", () => {
    expect(mapCatalogExerciseMuscles({ ...benchPress, muscleGroup: "other", bodyPart: "waist" })?.primaryMuscles).toEqual([
      "abs",
    ]);
  });

  it("returns null when no ranking group can be derived", () => {
    expect(
      mapCatalogExerciseMuscles({ ...benchPress, muscleGroup: "other", bodyPart: "cardio", secondaryMuscles: [] }),
    ).toBeNull();
  });

  it("maps every exercise shipped in the catalog", () => {
    for (const exercise of INITIAL_CATALOG_EXERCISES) {
      expect(mapCatalogExerciseMuscles(exercise)).not.toBeNull();
    }
  });
});
