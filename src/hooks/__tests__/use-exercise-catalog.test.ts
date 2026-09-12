import { renderHook, act } from "@testing-library/react-native";
import { useExerciseCatalog } from "../use-exercise-catalog";

describe("useExerciseCatalog", () => {
  it("initializes with exercises and default 'all' filter", async () => {
    const { result, unmount } = await renderHook(() => useExerciseCatalog());

    expect(result.current.exercises.length).toBeGreaterThanOrEqual(5);
    expect(result.current.filteredExercises.length).toBe(
      result.current.exercises.length
    );
    expect(result.current.categoryFilter).toBe("all");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.selectedExercise).toBeNull();

    unmount();
  });

  it("filters exercises by body part category", async () => {
    const { result, unmount } = await renderHook(() => useExerciseCatalog());

    await act(async () => {
      result.current.setCategoryFilter("chest");
    });

    expect(result.current.categoryFilter).toBe("chest");
    expect(
      result.current.filteredExercises.every((e) => e.bodyPart === "chest")
    ).toBe(true);
    expect(result.current.filteredExercises.length).toBeGreaterThan(0);

    unmount();
  });

  it("filters exercises by search query (case-insensitive)", async () => {
    const { result, unmount } = await renderHook(() => useExerciseCatalog());

    await act(async () => {
      result.current.setSearchQuery("ławce");
    });

    expect(
      result.current.filteredExercises.every(
        (e) =>
          e.name.toLowerCase().includes("ławce") ||
          e.target.toLowerCase().includes("ławce")
      )
    ).toBe(true);

    unmount();
  });

  it("handles opening and closing exercise preview modal", async () => {
    const { result, unmount } = await renderHook(() => useExerciseCatalog());
    const firstExercise = result.current.exercises[0];

    await act(async () => {
      result.current.openPreview(firstExercise);
    });

    expect(result.current.selectedExercise).toEqual(firstExercise);

    await act(async () => {
      result.current.closePreview();
    });

    expect(result.current.selectedExercise).toBeNull();

    unmount();
  });

  it("filters exercises by equipment type (dumbbell, barbell, bodyweight)", async () => {
    const { result, unmount } = await renderHook(() => useExerciseCatalog());

    // Dumbbells
    await act(async () => {
      result.current.setEquipmentFilter("dumbbell");
    });
    expect(result.current.equipmentFilter).toBe("dumbbell");
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
    expect(
      result.current.filteredExercises.every((e) =>
        e.equipment.toLowerCase().includes("hant")
      )
    ).toBe(true);
    expect(result.current.filteredExercises.length).toBeGreaterThan(0);

    // Barbells
    await act(async () => {
      result.current.setEquipmentFilter("barbell");
    });
    expect(result.current.equipmentFilter).toBe("barbell");
    expect(
      result.current.filteredExercises.every((e) =>
        e.equipment.toLowerCase().includes("sztang")
      )
    ).toBe(true);
    expect(result.current.filteredExercises.length).toBeGreaterThan(0);

    // Bodyweight
    await act(async () => {
      result.current.setEquipmentFilter("bodyweight");
    });
    expect(result.current.equipmentFilter).toBe("bodyweight");
    expect(result.current.filteredExercises.length).toBeGreaterThan(0);

    unmount();
  });

  it("combines muscle group and equipment filters", async () => {
    const { result, unmount } = await renderHook(() => useExerciseCatalog());

    await act(async () => {
      result.current.setCategoryFilter("chest");
      result.current.setEquipmentFilter("dumbbell");
    });

    expect(result.current.activeFilterCount).toBe(2);
    expect(
      result.current.filteredExercises.every(
        (e) =>
          e.bodyPart === "chest" && e.equipment.toLowerCase().includes("hant")
      )
    ).toBe(true);
    expect(result.current.filteredExercises.length).toBeGreaterThan(0);

    unmount();
  });

  it("resets all filters back to default", async () => {
    const { result, unmount } = await renderHook(() => useExerciseCatalog());

    await act(async () => {
      result.current.setCategoryFilter("chest");
      result.current.setEquipmentFilter("dumbbell");
      result.current.setSearchQuery("wyciskanie");
    });

    expect(result.current.hasActiveFilters).toBe(true);

    await act(async () => {
      result.current.resetFilters();
    });

    expect(result.current.categoryFilter).toBe("all");
    expect(result.current.equipmentFilter).toBe("all");
    expect(result.current.searchQuery).toBe("");
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);

    unmount();
  });
});

