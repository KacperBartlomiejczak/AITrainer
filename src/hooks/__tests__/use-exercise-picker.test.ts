import { act, renderHook } from "@testing-library/react-native";
import { INITIAL_CATALOG_EXERCISES } from "../use-exercise-catalog";
import { useExercisePicker } from "../use-exercise-picker";

describe("useExercisePicker", () => {
  it("opens and closes, clearing the search on close", async () => {
    const { result, unmount } = await renderHook(() => useExercisePicker());
    expect(result.current.isOpen).toBe(false);

    await act(async () => result.current.open());
    await act(async () => result.current.setQuery("martwy"));
    expect(result.current.isOpen).toBe(true);

    await act(async () => result.current.close());
    expect(result.current).toMatchObject({ isOpen: false, query: "" });
    unmount();
  });

  it("lists the whole catalog by default", async () => {
    const { result, unmount } = await renderHook(() => useExercisePicker());
    expect(result.current.exercises).toHaveLength(INITIAL_CATALOG_EXERCISES.length);
    unmount();
  });

  it("filters by name or target muscle, ignoring case and Polish diacritics", async () => {
    const { result, unmount } = await renderHook(() => useExercisePicker());

    await act(async () => result.current.setQuery("MARTWY"));
    expect(result.current.exercises.map((exercise) => exercise.name)).toContain("Martwy ciąg");

    await act(async () => result.current.setQuery("klatka"));
    expect(result.current.exercises.length).toBeGreaterThan(0);
    expect(result.current.exercises.every((exercise) => /klat/i.test(`${exercise.name} ${exercise.target}`))).toBe(true);

    await act(async () => result.current.setQuery("wyciag"));
    expect(result.current.exercises.some((exercise) => exercise.name.toLowerCase().includes("wyciąg"))).toBe(true);

    await act(async () => result.current.setQuery("zzz-nie-ma"));
    expect(result.current.exercises).toEqual([]);
    unmount();
  });

  it("filters by muscle group and equipment together with the search", async () => {
    const { result, unmount } = await renderHook(() => useExercisePicker());

    await act(async () => result.current.setMuscleFilter("legs"));
    await act(async () => result.current.setEquipmentFilter("barbell"));
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.exercises.map((exercise) => exercise.name)).toContain("Przysiad ze sztangą (Full Squat)");
    expect(result.current.exercises.every((exercise) => exercise.equipment === "Sztanga")).toBe(true);

    await act(async () => result.current.setQuery("wyskok"));
    expect(result.current.exercises).toEqual([]);

    await act(async () => result.current.resetFilters());
    expect(result.current).toMatchObject({ muscleFilter: "all", equipmentFilter: "all", query: "", hasActiveFilters: false });
    expect(result.current.exercises).toHaveLength(INITIAL_CATALOG_EXERCISES.length);
    unmount();
  });

  it("opens an exercise preview and clears filters and preview when the picker closes", async () => {
    const { result, unmount } = await renderHook(() => useExercisePicker());
    const exercise = INITIAL_CATALOG_EXERCISES[0]!;

    await act(async () => result.current.open());
    await act(async () => result.current.setMuscleFilter("chest"));
    await act(async () => result.current.openPreview(exercise));
    expect(result.current.previewExercise).toEqual(exercise);

    await act(async () => result.current.closePreview());
    expect(result.current.previewExercise).toBeNull();

    await act(async () => result.current.openPreview(exercise));
    await act(async () => result.current.close());
    expect(result.current).toMatchObject({ isOpen: false, muscleFilter: "all", previewExercise: null });
    unmount();
  });

  it("opens the filter sheet from the button and counts active filters", async () => {
    const { result, unmount } = await renderHook(() => useExercisePicker());

    await act(async () => result.current.openFilterSheet());
    expect(result.current.isFilterSheetOpen).toBe(true);
    await act(async () => result.current.setMuscleFilter("back"));
    await act(async () => result.current.setEquipmentFilter("dumbbell"));
    await act(async () => result.current.setQuery("wiosłowanie"));
    // The search phrase is not a filter of the sheet
    expect(result.current.activeFilterCount).toBe(2);

    await act(async () => result.current.closeFilterSheet());
    expect(result.current).toMatchObject({ isFilterSheetOpen: false, muscleFilter: "back" });

    await act(async () => result.current.openFilterSheet());
    await act(async () => result.current.close());
    expect(result.current).toMatchObject({ isFilterSheetOpen: false, activeFilterCount: 0 });
    unmount();
  });
});
