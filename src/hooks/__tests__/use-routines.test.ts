import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useRoutines } from "../use-routines";
import { useRouter } from "expo-router";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { createRoutine } from "@/db/workout-history";
import { useLiveWorkoutStore } from "@/stores/live-workout.store";
import type { NewUserRoutine } from "@/schemas/workout-history.schema";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

const userRoutine: NewUserRoutine = {
  id: "rtn_user_test",
  title: "Moja rutyna",
  description: "Testowa rutyna użytkownika",
  level: "beginner",
  daysPerWeek: 2,
  durationMinutes: 30,
  exercises: [{ id: "rtx_1", name: "Pompki", targetMuscle: "Klatka", sets: 3, targetReps: "10", restSeconds: 60 }],
};

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

  it("deletes a user-created routine and reloads the list", async () => {
    await saveLocalProfile();
    await createRoutine(userRoutine);
    const { result, unmount } = await renderHook(() => useRoutines());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.routines.map((routine) => routine.id)).toContain("rtn_user_test");

    await act(async () => {
      await result.current.deleteRoutine("rtn_user_test");
    });

    expect(result.current.routines.map((routine) => routine.id)).not.toContain("rtn_user_test");
    unmount();
  });

  it("never deletes a built-in routine", async () => {
    const { result, unmount } = await renderHook(() => useRoutines());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteRoutine("rtn_fbw_a");
    });

    expect(result.current.routines.map((routine) => routine.id)).toContain("rtn_fbw_a");
    unmount();
  });
});
