import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { Alert, type AlertButton } from "react-native";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { saveWorkoutSession } from "@/db/workout-history";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import { useLiveWorkoutStore } from "@/stores/live-workout.store";
import { INITIAL_CATALOG_EXERCISES } from "../use-exercise-catalog";
import { useLiveWorkout } from "../use-live-workout";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

const benchPress = INITIAL_CATALOG_EXERCISES.find((exercise) => exercise.id === "0025") as CatalogExercise;

async function saveBenchPressRecord(weightKg: number, reps: number) {
  await saveWorkoutSession({
    routineId: null,
    title: "Poprzedni trening",
    startedAt: new Date("2026-09-01T17:00:00.000Z"),
    completedAt: new Date("2026-09-01T18:00:00.000Z"),
    exercises: [
      {
        catalogExerciseId: "0025",
        name: benchPress.name,
        targetMuscle: benchPress.target,
        sets: 1,
        targetReps: String(reps),
        completed: true,
        loggedSets: [{ weightKg, reps, tag: null, isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false }],
      },
    ],
  });
}

describe("useLiveWorkout", () => {
  beforeEach(async () => {
    useLiveWorkoutStore.getState().discardWorkout();
    await saveLocalProfile();
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("starts the workout when the screen opens and shows empty stats", async () => {
    const { result, unmount } = await renderHook(() => useLiveWorkout());

    expect(useLiveWorkoutStore.getState().session).not.toBeNull();
    expect(result.current.exercises).toEqual([]);
    expect(result.current.stats).toEqual({ completedSetCount: 0, totalVolumeKg: 0, trainedMuscles: [] });
    unmount();
  });

  it("updates sets, volume and trained muscles as the user logs sets", async () => {
    const { result, unmount } = await renderHook(() => useLiveWorkout());

    await act(async () => {
      result.current.addExercise(benchPress);
    });
    const exercise = result.current.exercises[0];
    const setId = exercise?.sets[0]?.id ?? "";
    await act(async () => result.current.updateSet(exercise?.id ?? "", setId, { weightKg: 60, reps: 10 }));
    await act(async () => result.current.toggleSetCompleted(exercise?.id ?? "", setId));

    expect(result.current.stats).toMatchObject({ completedSetCount: 1, totalVolumeKg: 600 });
    expect(result.current.stats.trainedMuscles).toContainEqual({ muscle: "chest", intensity: "primary" });
    unmount();
  });

  it("shows no record when the user logs an exercise for the first time", async () => {
    const { result, unmount } = await renderHook(() => useLiveWorkout());

    await act(async () => {
      result.current.addExercise(benchPress);
    });
    const exerciseId = result.current.exercises[0]?.id ?? "";
    const setId = result.current.exercises[0]?.sets[0]?.id ?? "";
    await act(async () => result.current.updateSet(exerciseId, setId, { weightKg: 200, reps: 10, isCompleted: true }));
    await waitFor(() => expect(result.current.personalBestsStatus).toBe("ready"));

    expect(result.current.personalRecordHits.size).toBe(0);
    expect(result.current.personalRecordCount).toBe(0);
    unmount();
  });

  it("marks MAX and SERIA only when the set beats the records stored in the database", async () => {
    await saveBenchPressRecord(70, 5); // 1RM ≈ 81.67 kg, best set 350 kg
    const { result, unmount } = await renderHook(() => useLiveWorkout());

    await act(async () => {
      result.current.addExercise(benchPress);
    });
    const exerciseId = result.current.exercises[0]?.id ?? "";
    const setId = result.current.exercises[0]?.sets[0]?.id ?? "";
    await act(async () => result.current.updateSet(exerciseId, setId, { weightKg: 70, reps: 5, isCompleted: true }));
    await waitFor(() => expect(result.current.personalBestsStatus).toBe("ready"));
    expect(result.current.personalRecordHits.has(setId)).toBe(false);

    await act(async () => result.current.updateSet(exerciseId, setId, { weightKg: 72.5 }));
    expect(result.current.personalRecordHits.get(setId)).toEqual(["one_rep_max", "best_set_volume"]);
    expect(result.current.personalRecordCount).toBe(2);

    await act(async () => result.current.setSetTag(exerciseId, setId, "warmup"));
    expect(result.current.personalRecordHits.has(setId)).toBe(false);
    unmount();
  });

  it("opens and closes the set tag dialog", async () => {
    const { result, unmount } = await renderHook(() => useLiveWorkout());
    await act(async () => {
      result.current.addExercise(benchPress);
    });
    const exerciseId = result.current.exercises[0]?.id ?? "";
    const setId = result.current.exercises[0]?.sets[0]?.id ?? "";

    await act(async () => result.current.openTagDialog(exerciseId, setId));
    expect(result.current.tagDialogTarget).toEqual({ exerciseId, setId });
    expect(result.current.tagDialogSet?.id).toBe(setId);

    await act(async () => result.current.selectTag("drop_set"));
    expect(result.current.exercises[0]?.sets[0]?.tag).toBe("drop_set");
    expect(result.current.tagDialogTarget).toBeNull();

    await act(async () => result.current.openTagDialog(exerciseId, setId));
    await act(async () => result.current.removeTaggedSet());
    expect(result.current.exercises).toEqual([]);
    unmount();
  });

  it("asks for confirmation before throwing the workout away", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const { result, unmount } = await renderHook(() => useLiveWorkout());

    await act(async () => result.current.confirmDiscard());
    expect(useLiveWorkoutStore.getState().session).not.toBeNull();

    const buttons: AlertButton[] = alertSpy.mock.calls[0]?.[2] ?? [];
    const discardButton = buttons.find((button) => button.style === "destructive");
    await act(async () => discardButton?.onPress?.());
    expect(useLiveWorkoutStore.getState().session).toBeNull();
    alertSpy.mockRestore();
    unmount();
  });

  it("discards the workout and goes back to the workouts list", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => useLiveWorkout());

    await act(async () => result.current.discardWorkout());

    expect(useLiveWorkoutStore.getState().session).toBeNull();
    expect(router.replace).toHaveBeenCalledWith("/workouts");
    unmount();
  });
});
