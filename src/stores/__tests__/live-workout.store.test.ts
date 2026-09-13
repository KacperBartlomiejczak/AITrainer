import { INITIAL_CATALOG_EXERCISES } from "@/hooks/use-exercise-catalog";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import { LiveWorkoutSessionSchema, MAX_LIVE_WORKOUT_EXERCISES } from "@/schemas/live-workout.schema";
import { MAX_SETS_PER_EXERCISE } from "@/schemas/workout-history.schema";
import { useLiveWorkoutStore } from "../live-workout.store";

const benchPress = INITIAL_CATALOG_EXERCISES.find((exercise) => exercise.id === "0025") as CatalogExercise;
const store = () => useLiveWorkoutStore.getState();

function startWithBenchPress() {
  store().startWorkout(1_000);
  store().addExercise(benchPress);
  const exercise = store().session?.exercises[0];
  if (!exercise) throw new Error("exercise was not added");
  return exercise;
}

describe("useLiveWorkoutStore", () => {
  beforeEach(() => {
    store().discardWorkout();
  });

  it("starts an empty workout once; starting again keeps the running session", () => {
    store().startWorkout(1_000);
    store().addExercise(benchPress);
    store().startWorkout(5_000);

    expect(store().session?.startedAt).toBe(1_000);
    expect(store().session?.exercises).toHaveLength(1);
  });

  it("adds a catalog exercise with one empty set and keeps the session valid", () => {
    const exercise = startWithBenchPress();

    expect(exercise).toMatchObject({ catalogExerciseId: "0025", primaryMuscles: ["chest"] });
    expect(exercise.sets).toEqual([expect.objectContaining({ weightKg: null, reps: null, isCompleted: false })]);
    expect(LiveWorkoutSessionSchema.safeParse(store().session).success).toBe(true);
  });

  it("does nothing without a running workout", () => {
    expect(store().addExercise(benchPress)).toBe(false);
    expect(store().session).toBeNull();
  });

  it("rejects exercises beyond the limit", () => {
    store().startWorkout(1_000);
    for (let index = 0; index < MAX_LIVE_WORKOUT_EXERCISES; index += 1) {
      expect(store().addExercise(benchPress)).toBe(true);
    }
    expect(store().addExercise(benchPress)).toBe(false);
    expect(store().session?.exercises).toHaveLength(MAX_LIVE_WORKOUT_EXERCISES);
  });

  it("adds sets that copy the previous weight and reps, up to the limit", () => {
    const exercise = startWithBenchPress();
    const firstSet = exercise.sets[0];
    store().updateSet(exercise.id, firstSet?.id ?? "", { weightKg: 60, reps: 8 });

    store().addSet(exercise.id);
    const sets = store().session?.exercises[0]?.sets ?? [];
    expect(sets).toHaveLength(2);
    expect(sets[1]).toMatchObject({ weightKg: 60, reps: 8, tag: null, isCompleted: false });

    for (let index = 2; index < MAX_SETS_PER_EXERCISE + 3; index += 1) {
      store().addSet(exercise.id);
    }
    expect(store().session?.exercises[0]?.sets).toHaveLength(MAX_SETS_PER_EXERCISE);
  });

  it("ignores invalid set values", () => {
    const exercise = startWithBenchPress();
    const setId = exercise.sets[0]?.id ?? "";

    store().updateSet(exercise.id, setId, { weightKg: -10 });
    store().updateSet(exercise.id, setId, { reps: 0 });

    expect(store().session?.exercises[0]?.sets[0]).toMatchObject({ weightKg: null, reps: null });
  });

  it("completes a set only when reps are filled in, and un-completes it when reps are cleared", () => {
    const exercise = startWithBenchPress();
    const setId = exercise.sets[0]?.id ?? "";

    store().toggleSetCompleted(exercise.id, setId);
    expect(store().session?.exercises[0]?.sets[0]?.isCompleted).toBe(false);

    store().updateSet(exercise.id, setId, { reps: 10 });
    store().toggleSetCompleted(exercise.id, setId);
    expect(store().session?.exercises[0]?.sets[0]?.isCompleted).toBe(true);

    store().updateSet(exercise.id, setId, { reps: null });
    expect(store().session?.exercises[0]?.sets[0]).toMatchObject({ reps: null, isCompleted: false });
  });

  it("tags a set as warm-up / drop set / failed and clears the tag", () => {
    const exercise = startWithBenchPress();
    const setId = exercise.sets[0]?.id ?? "";

    store().setSetTag(exercise.id, setId, "warmup");
    expect(store().session?.exercises[0]?.sets[0]?.tag).toBe("warmup");
    store().setSetTag(exercise.id, setId, "failed");
    expect(store().session?.exercises[0]?.sets[0]?.tag).toBe("failed");
    store().setSetTag(exercise.id, setId, null);
    expect(store().session?.exercises[0]?.sets[0]?.tag).toBeNull();
  });

  it("removes a set, and the exercise together with its last set", () => {
    const exercise = startWithBenchPress();
    store().addSet(exercise.id);
    const [first, second] = store().session?.exercises[0]?.sets ?? [];

    store().removeSet(exercise.id, first?.id ?? "");
    expect(store().session?.exercises[0]?.sets.map((set) => set.id)).toEqual([second?.id]);

    store().removeSet(exercise.id, second?.id ?? "");
    expect(store().session?.exercises).toEqual([]);
  });

  it("removes an exercise and discards the whole workout", () => {
    const exercise = startWithBenchPress();
    store().removeExercise(exercise.id);
    expect(store().session?.exercises).toEqual([]);

    store().discardWorkout();
    expect(store().session).toBeNull();
  });

  it("copies a typed weight to the unchecked regular sets of the same exercise", () => {
    const exercise = startWithBenchPress();
    store().addSet(exercise.id);
    store().addSet(exercise.id);
    const [first, second, third] = store().session?.exercises[0]?.sets ?? [];
    store().setSetTag(exercise.id, third?.id ?? "", "warmup");

    store().updateSet(exercise.id, first?.id ?? "", { weightKg: 80 });

    expect(store().session?.exercises[0]?.sets.map((set) => [set.id, set.weightKg])).toEqual([
      [first?.id, 80],
      [second?.id, 80],
      [third?.id, null],
    ]);
  });
});
