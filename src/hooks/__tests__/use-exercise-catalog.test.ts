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
});
