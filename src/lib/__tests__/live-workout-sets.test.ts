import type { LiveWorkoutExercise, LiveWorkoutSet } from "@/schemas/live-workout.schema";
import { applySetPatch } from "../live-workout-sets";

const set = (id: string, overrides: Partial<LiveWorkoutSet> = {}): LiveWorkoutSet => ({
  id,
  weightKg: 50,
  reps: 10,
  tag: null,
  isCompleted: false,
  ...overrides,
});

const exercise = (sets: LiveWorkoutSet[]): LiveWorkoutExercise => ({
  id: "e1",
  catalogExerciseId: "0025",
  name: "Wyciskanie",
  targetMuscle: "Klatka",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  sets,
});

const weights = (value: LiveWorkoutExercise) => value.sets.map((current) => current.weightKg);

describe("applySetPatch", () => {
  it("copies the weight of a regular set to every other unchecked regular set", () => {
    const updated = applySetPatch(
      exercise([
        set("warmup", { tag: "warmup", weightKg: 20 }),
        set("done", { isCompleted: true }),
        set("edited"),
        set("next"),
        set("drop", { tag: "drop_set", weightKg: 30 }),
        set("failed", { tag: "failed", weightKg: 55 }),
        set("last", { weightKg: null }),
      ]),
      "edited",
      { weightKg: 60 },
    );

    expect(weights(updated)).toEqual([20, 50, 60, 60, 30, 55, 60]);
  });

  it("also copies a cleared weight, but never reps", () => {
    const updated = applySetPatch(exercise([set("a"), set("b", { reps: 8 })]), "a", { weightKg: null, reps: 12 });

    expect(updated.sets.map((current) => [current.weightKg, current.reps])).toEqual([
      [null, 12],
      [null, 8],
    ]);
  });

  it("does not copy the weight of a warm-up, drop set or failed set", () => {
    for (const tag of ["warmup", "drop_set", "failed"] as const) {
      const updated = applySetPatch(exercise([set("tagged", { tag }), set("regular")]), "tagged", { weightKg: 90 });
      expect(weights(updated)).toEqual([90, 50]);
    }
  });

  it("copies from a completed regular set to the unchecked ones", () => {
    const updated = applySetPatch(exercise([set("a", { isCompleted: true }), set("b")]), "a", { weightKg: 70 });
    expect(weights(updated)).toEqual([70, 70]);
  });

  it("un-completes a set whose reps were cleared and keeps other fields", () => {
    const updated = applySetPatch(exercise([set("a", { isCompleted: true })]), "a", { reps: null });
    expect(updated.sets[0]).toMatchObject({ reps: null, isCompleted: false, weightKg: 50 });
  });

  it("returns the exercise unchanged for an unknown set", () => {
    const original = exercise([set("a")]);
    expect(applySetPatch(original, "missing", { weightKg: 1 })).toBe(original);
  });
});
