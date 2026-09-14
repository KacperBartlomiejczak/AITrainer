import { act, renderHook, waitFor } from "@testing-library/react-native";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { saveWorkoutSession } from "@/db/workout-history";
import { INITIAL_CATALOG_EXERCISES } from "../use-exercise-catalog";
import { useExerciseProgressSheet } from "../use-exercise-progress-sheet";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

const bench = INITIAL_CATALOG_EXERCISES.find((exercise) => exercise.name === "Wyciskanie sztangi na ławce poziomej")!;
const pushUps = INITIAL_CATALOG_EXERCISES.find((exercise) => exercise.name === "Pompki szerokim rozstawem rąk")!;
const NO_RECORDS = { isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false };

async function saveWorkout(catalogExerciseId: string, weightKg: number, reps: number) {
  await saveWorkoutSession({
    routineId: null,
    title: "Trening",
    startedAt: new Date("2026-09-10T17:00:00.000Z"),
    completedAt: new Date("2026-09-10T18:00:00.000Z"),
    exercises: [
      {
        catalogExerciseId,
        name: "Ćwiczenie",
        targetMuscle: "Klatka",
        sets: 1,
        targetReps: String(reps),
        completed: true,
        loggedSets: [{ weightKg, reps, tag: null, ...NO_RECORDS }],
      },
    ],
  });
}

describe("useExerciseProgressSheet", () => {
  beforeEach(async () => {
    await saveLocalProfile();
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("is closed until an exercise is opened", async () => {
    const { result, unmount } = await renderHook(() => useExerciseProgressSheet());
    expect(result.current).toMatchObject({ target: null, status: "idle", progress: null });
    unmount();
  });

  it("loads the saved progress of the opened exercise with the 1RM chart selected", async () => {
    await saveWorkout(bench.id, 80, 5);
    const { result, unmount } = await renderHook(() => useExerciseProgressSheet());

    await act(async () => result.current.open({ catalogExerciseId: bench.id, name: bench.name }));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    expect(result.current.progress?.summary.oneRepMaxKg).toBe(93.33);
    expect(result.current.availableMetrics).toEqual(["one_rep_max", "best_set_volume"]);
    expect(result.current.metric).toBe("one_rep_max");

    await act(async () => result.current.setMetric("best_set_volume"));
    expect(result.current.metric).toBe("best_set_volume");

    await act(async () => result.current.close());
    expect(result.current).toMatchObject({ target: null, status: "idle" });
    unmount();
  });

  it("picks the reps chart for a bodyweight exercise and shows the technique of the exercise", async () => {
    await saveWorkout(pushUps.id, 0, 25);
    const { result, unmount } = await renderHook(() => useExerciseProgressSheet());

    await act(async () => result.current.open({ catalogExerciseId: pushUps.id, name: pushUps.name }));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.metric).toBe("max_reps");

    await act(async () => result.current.showTechnique());
    expect(result.current.techniqueExercise?.id).toBe(pushUps.id);
    await act(async () => result.current.closeTechnique());
    expect(result.current.techniqueExercise).toBeNull();
    unmount();
  });

  it("reports an empty history for an exercise that was never saved", async () => {
    const { result, unmount } = await renderHook(() => useExerciseProgressSheet());

    await act(async () => result.current.open({ catalogExerciseId: bench.id, name: bench.name }));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.progress?.summary.workoutCount).toBe(0);
    expect(result.current.availableMetrics).toEqual([]);
    unmount();
  });
});
