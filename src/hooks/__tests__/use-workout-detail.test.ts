import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useWorkoutDetail } from "../use-workout-detail";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { loadWorkoutHistory } from "@/db/workout-history";
import { getFakeFileSystem } from "@/lib/testing/fake-file-system";
import { pickWorkoutPhoto } from "@/lib/workout-photo-picker";
import { useActiveWorkoutStore } from "@/stores/active-workout.store";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));
jest.mock("@/lib/workout-photo-picker", () => ({ pickWorkoutPhoto: jest.fn() }));

const ROUTINE_ID = "rtn_fbw_a";
const FIRST_EXERCISE_ID = "rtn_fbw_a_ex_1";

async function renderLoadedWorkout(routineId = ROUTINE_ID) {
  const rendered = await renderHook(() => useWorkoutDetail(routineId));
  await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
  return rendered;
}

describe("useWorkoutDetail", () => {
  beforeEach(async () => {
    useActiveWorkoutStore.getState().finishWorkout();
    jest.mocked(pickWorkoutPhoto).mockReset();
    await saveLocalProfile();
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("loads a built-in routine from the database", async () => {
    const { result, unmount } = await renderLoadedWorkout();

    expect(result.current.routine?.title).toBe("FBW A — Całe ciało");
    expect(result.current.routine?.exercises.length).toBeGreaterThan(0);
    unmount();
  });

  it("returns null for an unknown routine id", async () => {
    const { result, unmount } = await renderLoadedWorkout("unknown_id");
    expect(result.current.routine).toBeNull();
    unmount();
  });

  it("starts a workout and toggles an exercise", async () => {
    const { result, unmount } = await renderLoadedWorkout();

    await act(async () => result.current.startWorkout());
    expect(result.current.isActive).toBe(true);
    expect(useActiveWorkoutStore.getState().startedAt).not.toBeNull();

    await act(async () => result.current.toggleExercise(FIRST_EXERCISE_ID));
    expect(result.current.completedExerciseIds).toContain(FIRST_EXERCISE_ID);

    await act(async () => result.current.toggleExercise(FIRST_EXERCISE_ID));
    expect(result.current.completedExerciseIds).not.toContain(FIRST_EXERCISE_ID);
    unmount();
  });

  it("does not save a workout without completed exercises", async () => {
    const { result, unmount } = await renderLoadedWorkout();

    await act(async () => result.current.startWorkout());
    await act(async () => {
      await result.current.finishWorkout();
    });

    expect(result.current.finishError).toBe("Odhacz przynajmniej jedno ćwiczenie, aby zapisać trening");
    expect(result.current.isActive).toBe(true);
    await expect(loadWorkoutHistory()).resolves.toEqual([]);
    unmount();
  });

  it("saves the finished workout and offers an optional photo", async () => {
    const { result, unmount } = await renderLoadedWorkout();

    await act(async () => result.current.startWorkout());
    await act(async () => result.current.toggleExercise(FIRST_EXERCISE_ID));
    await act(async () => {
      await result.current.finishWorkout();
    });

    const [saved] = await loadWorkoutHistory();
    expect(saved?.routineId).toBe(ROUTINE_ID);
    expect(saved?.photoUri).toBeNull();
    expect(saved?.exercises.filter((exercise) => exercise.completed)).toHaveLength(1);
    expect(result.current.isActive).toBe(false);
    expect(result.current.finishError).toBeNull();
    expect(result.current.photoSheet.isOpen).toBe(true);
    unmount();
  });

  it("goes to the profile when the user skips the photo", async () => {
    const router = useRouter();
    const { result, unmount } = await renderLoadedWorkout();

    await act(async () => result.current.startWorkout());
    await act(async () => result.current.toggleExercise(FIRST_EXERCISE_ID));
    await act(async () => {
      await result.current.finishWorkout();
    });
    await act(async () => result.current.photoSheet.dismiss());

    expect(result.current.photoSheet.isOpen).toBe(false);
    expect(router.push).toHaveBeenCalledWith("/user-profile");
    unmount();
  });

  it("goes to the profile after adding a photo to the finished workout", async () => {
    const router = useRouter();
    getFakeFileSystem().addFile("file:///cache/picked.jpg");
    jest.mocked(pickWorkoutPhoto).mockResolvedValueOnce({ status: "picked", uri: "file:///cache/picked.jpg" });
    const { result, unmount } = await renderLoadedWorkout();

    await act(async () => result.current.startWorkout());
    await act(async () => result.current.toggleExercise(FIRST_EXERCISE_ID));
    await act(async () => {
      await result.current.finishWorkout();
    });
    await act(async () => {
      await result.current.photoSheet.selectSource("camera");
    });

    expect((await loadWorkoutHistory())[0]?.photoUri).not.toBeNull();
    expect(router.push).toHaveBeenCalledWith("/user-profile");
    unmount();
  });
});
