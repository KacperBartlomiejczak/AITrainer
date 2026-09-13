import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useRoutines } from "../use-routines";
import { useRouter } from "expo-router";
import { resetInMemoryDatabase } from "@/db/testing/in-memory-client";
import { useLiveWorkoutStore } from "@/stores/live-workout.store";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

describe("useRoutines", () => {
  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("returns the two basic routines stored in the database", async () => {
    const { result, unmount } = await renderHook(() => useRoutines());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.routines.map((routine) => routine.id)).toEqual(["rtn_fbw_a", "rtn_fbw_b"]);
    expect(result.current.filteredRoutines.length).toBe(result.current.routines.length);
    expect(result.current.filterLevel).toBe("all");

    unmount();
  });

  it("filters routines by level", async () => {
    const { result, unmount } = await renderHook(() => useRoutines());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.setFilterLevel("advanced");
    });
    expect(result.current.filteredRoutines).toEqual([]);

    await act(async () => {
      result.current.setFilterLevel("beginner");
    });
    expect(result.current.filterLevel).toBe("beginner");
    expect(result.current.filteredRoutines).toHaveLength(2);

    unmount();
  });

  it("navigates to workout when startRoutine is called", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useRoutines());

    await act(async () => {
      result.current.startRoutine("rtn_fbw_a");
    });

    expect(router.push).toHaveBeenCalledWith("/workout/rtn_fbw_a");

    unmount();
  });

  it("navigates to all exercises screen", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useRoutines());

    await act(async () => {
      result.current.openAllExercises();
    });

    expect(router.push).toHaveBeenCalledWith("/exercises");

    unmount();
  });

  it("opens the empty workout screen and knows when one is already running", async () => {
    const router = useRouter();
    useLiveWorkoutStore.getState().discardWorkout();
    const { result, unmount } = await renderHook(() => useRoutines());
    expect(result.current.hasActiveEmptyWorkout).toBe(false);

    await act(async () => {
      result.current.startEmptyWorkout();
    });
    expect(router.push).toHaveBeenCalledWith("/workout-session");

    await act(async () => {
      useLiveWorkoutStore.getState().startWorkout();
    });
    expect(result.current.hasActiveEmptyWorkout).toBe(true);
    useLiveWorkoutStore.getState().discardWorkout();
    unmount();
  });
});
