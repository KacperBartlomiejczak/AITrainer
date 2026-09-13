import { act, renderHook } from "@testing-library/react-native";
import { INITIAL_CATALOG_EXERCISES } from "../use-exercise-catalog";
import { useExercisePreview } from "../use-exercise-preview";

describe("useExercisePreview", () => {
  it("opens the catalog exercise of a workout exercise and closes it", async () => {
    const exercise = INITIAL_CATALOG_EXERCISES[0]!;
    const { result, unmount } = await renderHook(() => useExercisePreview());

    await act(async () => result.current.openPreview(exercise.id));
    expect(result.current.previewExercise?.name).toBe(exercise.name);

    await act(async () => result.current.closePreview());
    expect(result.current.previewExercise).toBeNull();
    unmount();
  });

  it("does nothing for an id that is not in the catalog", async () => {
    const { result, unmount } = await renderHook(() => useExercisePreview());

    await act(async () => result.current.openPreview("missing"));
    expect(result.current.previewExercise).toBeNull();
    unmount();
  });
});
