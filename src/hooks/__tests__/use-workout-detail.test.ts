import { renderHook, act } from "@testing-library/react-native";
import { useWorkoutDetail } from "../use-workout-detail";
import { useActiveWorkoutStore } from "@/stores/active-workout.store";

describe("useWorkoutDetail", () => {
  beforeEach(() => {
    useActiveWorkoutStore.getState().finishWorkout();
  });

  it("loads routine details for a valid routine id", async () => {
    const { result, unmount } = await renderHook(() =>
      useWorkoutDetail("rtn_fbw_01")
    );
    expect(result.current.routine).not.toBeNull();
    expect(result.current.routine?.title).toBe("FBW dla Początkujących");
    expect(result.current.routine?.exercises.length).toBeGreaterThan(0);
    unmount();
  });

  it("returns null for unknown routine id", async () => {
    const { result, unmount } = await renderHook(() =>
      useWorkoutDetail("unknown_id")
    );
    expect(result.current.routine).toBeNull();
    unmount();
  });

  it("starts workout and toggles exercise completed", async () => {
    const { result, unmount } = await renderHook(() =>
      useWorkoutDetail("rtn_fbw_01")
    );

    await act(async () => {
      result.current.startWorkout();
    });

    expect(result.current.isActive).toBe(true);

    await act(async () => {
      result.current.toggleExercise("ex_fbw_1");
    });

    expect(result.current.completedExerciseIds).toContain("ex_fbw_1");

    await act(async () => {
      result.current.toggleExercise("ex_fbw_1");
    });

    expect(result.current.completedExerciseIds).not.toContain("ex_fbw_1");
    unmount();
  });
});
