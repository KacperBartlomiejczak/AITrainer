import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import WorkoutSessionScreen from "../workout-session";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { loadWorkoutHistory, saveWorkoutSession } from "@/db/workout-history";
import { INITIAL_CATALOG_EXERCISES } from "@/hooks/use-exercise-catalog";
import { useLiveWorkoutStore } from "@/stores/live-workout.store";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));
jest.mock("@/lib/workout-photo-picker", () => ({ pickWorkoutPhoto: jest.fn() }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Looked up by name: catalog ids follow the exercise media dataset and may change
const catalogIdOf = (name: string) => {
  const exercise = INITIAL_CATALOG_EXERCISES.find((item) => item.name === name);
  if (!exercise) throw new Error(`missing catalog exercise ${name}`);
  return exercise.id;
};
const BENCH_PRESS_ID = catalogIdOf("Wyciskanie sztangi na ławce poziomej");

const PUSH_UPS_ID = catalogIdOf("Pompki szerokim rozstawem rąk");
const NO_RECORDS = { isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false };

async function addExercise(catalogId: string, query: string, openButtonTestId = "empty-add-exercise") {
  await act(async () => fireEvent.press(screen.getByTestId(openButtonTestId)));
  await act(async () => fireEvent.changeText(screen.getByTestId("exercise-picker-search"), query));
  await act(async () => fireEvent.press(screen.getByTestId(`exercise-picker-add-${catalogId}`)));
  const exercise = useLiveWorkoutStore.getState().session?.exercises.find((item) => item.catalogExerciseId === catalogId);
  if (!exercise) throw new Error("exercise was not added");
  return exercise;
}

const addBenchPress = () => addExercise(BENCH_PRESS_ID, "ławce poziomej");

async function logSet(setId: string, weight: string, reps: string) {
  await act(async () => fireEvent.changeText(screen.getByTestId(`set-weight-${setId}`), weight));
  await act(async () => fireEvent.changeText(screen.getByTestId(`set-reps-${setId}`), reps));
  await act(async () => fireEvent.press(screen.getByTestId(`set-toggle-${setId}`)));
}

async function savePreviousWorkout() {
  await saveWorkoutSession({
    routineId: null,
    title: "Poprzedni trening",
    startedAt: new Date("2026-09-01T17:00:00.000Z"),
    completedAt: new Date("2026-09-01T18:00:00.000Z"),
    exercises: [
      {
        catalogExerciseId: BENCH_PRESS_ID,
        name: "Wyciskanie sztangi na ławce poziomej",
        targetMuscle: "Klatka piersiowa",
        sets: 1,
        targetReps: "5",
        completed: true,
        loggedSets: [{ weightKg: 70, reps: 5, tag: null, ...NO_RECORDS }],
      },
      {
        catalogExerciseId: PUSH_UPS_ID,
        name: "Pompki szerokim rozstawem rąk",
        targetMuscle: "Klatka piersiowa",
        sets: 1,
        targetReps: "20",
        completed: true,
        loggedSets: [{ weightKg: 0, reps: 20, tag: null, ...NO_RECORDS }],
      },
    ],
  });
}

describe("WorkoutSessionScreen", () => {
  beforeEach(async () => {
    useLiveWorkoutStore.getState().discardWorkout();
    await saveLocalProfile();
  });

  afterEach(() => {
    useLiveWorkoutStore.getState().discardWorkout();
    resetInMemoryDatabase();
  });

  it("starts with a timer, zero stats, the body diagram and an empty state", async () => {
    const { unmount } = await render(<WorkoutSessionScreen />);

    expect(screen.getByTestId("live-workout-timer").props.children).toBe("00:00");
    expect(screen.getByTestId("live-workout-set-count").props.children).toBe(0);
    expect(screen.getByTestId("workout-muscle-map")).toBeTruthy();
    expect(screen.getByText("Zacznij od pierwszego ćwiczenia")).toBeTruthy();
    unmount();
  });

  it("wraps the exercise list in a keyboard-avoiding container", async () => {
    const { unmount } = await render(<WorkoutSessionScreen />);

    expect(screen.getByTestId("workout-session-keyboard-avoiding")).toBeTruthy();
    unmount();
  });

  it("logs a set, tags a warm-up, finishes and saves the workout to the database", async () => {
    const router = useRouter();
    const { unmount } = await render(<WorkoutSessionScreen />);
    const exercise = await addBenchPress();
    const setId = exercise.sets[0]?.id ?? "";

    expect(screen.queryByTestId("exercise-picker-search")).toBeNull();
    await act(async () => fireEvent.changeText(screen.getByTestId(`set-weight-${setId}`), "60"));
    await act(async () => fireEvent.changeText(screen.getByTestId(`set-reps-${setId}`), "10"));
    await act(async () => fireEvent.press(screen.getByTestId(`set-toggle-${setId}`)));

    expect(screen.getByTestId("live-workout-set-count").props.children).toBe(1);
    expect(screen.getByTestId("live-workout-volume").props.children).toBe("600 kg");
    // First time doing the exercise → nothing to beat → no record badges
    await waitFor(() => expect(screen.queryByTestId("set-record-badges")).toBeNull());
    expect(within(screen.getByTestId("workout-muscle-map")).getByText("Klatka piersiowa")).toBeTruthy();

    await act(async () => fireEvent.press(screen.getByTestId(`add-set-${exercise.id}`)));
    const secondSetId = useLiveWorkoutStore.getState().session?.exercises[0]?.sets[1]?.id ?? "";
    await act(async () => fireEvent.press(screen.getByTestId(`set-label-${setId}`)));
    await act(async () => fireEvent.press(screen.getByTestId("set-tag-warmup")));
    expect(screen.getByTestId(`set-label-${setId}`)).toHaveTextContent("R");
    expect(screen.getByTestId("live-workout-volume").props.children).toBe("0 kg");

    await act(async () => fireEvent.press(screen.getByTestId(`set-toggle-${secondSetId}`)));
    await act(async () => fireEvent.press(screen.getByTestId("live-workout-finish")));
    expect(screen.getByText("Podsumowanie treningu")).toBeTruthy();
    await act(async () => fireEvent.changeText(screen.getByTestId("finish-workout-title"), "Klatka"));
    await act(async () => fireEvent.press(screen.getByTestId("finish-workout-save")));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/user-profile"));
    const [entry] = await loadWorkoutHistory();
    expect(entry?.title).toBe("Klatka");
    expect(entry?.exercises[0]?.loggedSets.map((set) => [set.weightKg, set.reps, set.tag])).toEqual([
      [60, 10, "warmup"],
      [60, 10, null],
    ]);
    unmount();
  });

  it("does not open the summary before any set is completed", async () => {
    const { unmount } = await render(<WorkoutSessionScreen />);

    await act(async () => fireEvent.press(screen.getByTestId("live-workout-finish")));

    expect(screen.queryByText("Podsumowanie treningu")).toBeNull();
    expect(screen.getByText("Odhacz przynajmniej jedną serię, aby zakończyć trening.")).toBeTruthy();
    unmount();
  });

  it("shows MAX and SERIA for a heavier bench press and POWT. for more push-ups than last time, and saves them", async () => {
    await savePreviousWorkout();
    const { unmount } = await render(<WorkoutSessionScreen />);

    const bench = await addBenchPress();
    await logSet(bench.sets[0]?.id ?? "", "72,5", "5");
    await waitFor(() => expect(screen.getByText("MAX")).toBeTruthy());
    expect(screen.getByText("SERIA")).toBeTruthy();

    const pushUps = await addExercise(PUSH_UPS_ID, "pompki szerokim", "add-exercise-button");
    const pushUpSetId = pushUps.sets[0]?.id ?? "";
    await act(async () => fireEvent.changeText(screen.getByTestId(`set-reps-${pushUpSetId}`), "21"));
    await act(async () => fireEvent.press(screen.getByTestId(`set-toggle-${pushUpSetId}`)));
    await waitFor(() => expect(screen.getByText("POWT.")).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByTestId("live-workout-finish")));
    expect(screen.getByText("3 nowe rekordy 🔥")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("finish-workout-save")));

    await waitFor(async () => expect(await loadWorkoutHistory()).toHaveLength(2));
    const [latest] = await loadWorkoutHistory();
    expect(latest?.exercises.map((exercise) => exercise.loggedSets[0])).toEqual([
      expect.objectContaining({ weightKg: 72.5, isOneRepMaxRecord: true, isBestSetVolumeRecord: true, isMaxRepsRecord: false }),
      expect.objectContaining({ weightKg: 0, reps: 21, isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: true }),
    ]);
    unmount();
  });

  it("filters the exercise list, previews how to do an exercise and adds it from the preview", async () => {
    const { unmount } = await render(<WorkoutSessionScreen />);

    await act(async () => fireEvent.press(screen.getByTestId("empty-add-exercise")));
    await act(async () => fireEvent.press(screen.getByTestId("exercise-picker-filters-button")));
    await act(async () => fireEvent.press(screen.getByTestId("picker-muscle-legs")));
    await act(async () => fireEvent.press(screen.getByTestId("picker-equipment-barbell")));
    await act(async () => fireEvent.press(screen.getByTestId("apply-filters-button")));
    expect(screen.getByTestId("active-filter-badge")).toHaveTextContent("2");
    const squatId = catalogIdOf("Przysiad ze sztangą (Full Squat)");
    expect(screen.getByTestId(`exercise-picker-item-${squatId}`)).toBeTruthy();
    expect(screen.queryByTestId(`exercise-picker-item-${BENCH_PRESS_ID}`)).toBeNull();

    await act(async () => fireEvent.press(screen.getByTestId(`exercise-picker-item-${squatId}`)));
    expect(screen.getByTestId("close-exercise-preview-button")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("exercise-preview-action")));

    expect(screen.queryByTestId("exercise-picker-search")).toBeNull();
    const squat = useLiveWorkoutStore.getState().session?.exercises[0];
    expect(squat?.catalogExerciseId).toBe(squatId);

    // The technique can be checked again from the exercise card during the workout
    await act(async () => fireEvent.press(screen.getByTestId(`exercise-info-${squat?.id}`)));
    // Exercise name on the card and as the preview title
    expect(screen.getAllByText("Przysiad ze sztangą (Full Squat)")).toHaveLength(2);
    expect(screen.getByTestId("close-exercise-preview-button")).toBeTruthy();
    unmount();
  });

  it("shows the saved progress (max, best results, chart) after tapping the exercise card", async () => {
    await savePreviousWorkout(); // bench press 70 kg × 5
    const { unmount } = await render(<WorkoutSessionScreen />);
    const bench = await addBenchPress();

    expect(screen.getByTestId(`exercise-thumbnail-${bench.id}`)).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId(`exercise-progress-${bench.id}`)));

    await waitFor(() => expect(screen.getByText("Twój max")).toBeTruthy());
    expect(screen.getByText("≈ 81,5 kg")).toBeTruthy(); // 70 × (1 + 5/30) = 81,67 → 81,5
    // "Najcięższy" tile and the "Rekordowa seria" detail — the same set after one workout
    expect(screen.getAllByText("70 kg × 5")).toHaveLength(2);
    expect(screen.getAllByTestId("progress-chart-point")).toHaveLength(1);

    await act(async () => fireEvent.press(screen.getByTestId("progress-sheet-close")));
    const pushUps = await addExercise(PUSH_UPS_ID, "pompki szerokim", "add-exercise-button");
    await act(async () => fireEvent.press(screen.getByTestId(`exercise-progress-${pushUps.id}`)));
    await waitFor(() => expect(screen.getByText("Najwięcej powt.")).toBeTruthy());
    unmount();
  });

  it("shows an empty progress for an exercise done for the first time", async () => {
    const { unmount } = await render(<WorkoutSessionScreen />);
    const bench = await addBenchPress();

    await act(async () => fireEvent.press(screen.getByTestId(`exercise-progress-${bench.id}`)));
    await waitFor(() =>
      expect(screen.getByText("Zapisz trening z tym ćwiczeniem, a pokażemy Twoje postępy")).toBeTruthy(),
    );
    unmount();
  });

  it("copies the typed weight to unchecked regular sets and turns a ticked set green", async () => {
    const { unmount } = await render(<WorkoutSessionScreen />);
    const bench = await addBenchPress();
    const firstSetId = bench.sets[0]?.id ?? "";
    await act(async () => fireEvent.press(screen.getByTestId(`add-set-${bench.id}`)));
    await act(async () => fireEvent.press(screen.getByTestId(`add-set-${bench.id}`)));
    const [, secondSetId = "", thirdSetId = ""] = useLiveWorkoutStore.getState().session?.exercises[0]?.sets.map((set) => set.id) ?? [];

    await act(async () => fireEvent.changeText(screen.getByTestId(`set-reps-${secondSetId}`), "8"));
    await act(async () => fireEvent.press(screen.getByTestId(`set-toggle-${secondSetId}`)));
    await act(async () => fireEvent.changeText(screen.getByTestId(`set-weight-${firstSetId}`), "75"));

    expect(screen.getByTestId(`set-weight-${thirdSetId}`).props.value).toBe("75");
    // Ticked set keeps its own (empty) weight
    expect(screen.getByTestId(`set-weight-${secondSetId}`).props.value).toBe("");
    expect(screen.getByTestId(`set-row-${secondSetId}`).props.className).toContain("bg-[#16A34A]");
    unmount();
  });
});
