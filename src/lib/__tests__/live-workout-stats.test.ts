import type { LiveWorkoutExercise, LiveWorkoutSet } from "@/schemas/live-workout.schema";
import {
  canCompleteSet,
  computeLiveWorkoutStats,
  computeVolumeKg,
  formatElapsed,
  formatEstimatedKg,
  formatKg,
  getSetLabels,
} from "../live-workout-stats";

const set = (id: string, overrides: Partial<LiveWorkoutSet> = {}): LiveWorkoutSet => ({
  id,
  weightKg: 50,
  reps: 10,
  tag: null,
  isCompleted: true,
  ...overrides,
});

const benchPress = (sets: LiveWorkoutSet[]): LiveWorkoutExercise => ({
  id: "e1",
  catalogExerciseId: "0025",
  name: "Wyciskanie",
  targetMuscle: "Klatka",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["shoulders", "triceps"],
  sets,
});

const tricepsPushdown = (sets: LiveWorkoutSet[]): LiveWorkoutExercise => ({
  id: "e2",
  catalogExerciseId: "0073",
  name: "Prostowanie na wyciągu",
  targetMuscle: "Triceps",
  primaryMuscles: ["triceps"],
  secondaryMuscles: [],
  sets,
});

describe("computeLiveWorkoutStats", () => {
  it("returns zeros for an empty workout", () => {
    expect(computeLiveWorkoutStats([])).toEqual({ completedSetCount: 0, totalVolumeKg: 0, trainedMuscles: [] });
  });

  it("counts every completed set, including warm-ups and failed sets", () => {
    const stats = computeLiveWorkoutStats([
      benchPress([set("s1", { tag: "warmup" }), set("s2", { tag: "failed" }), set("s3", { isCompleted: false })]),
    ]);
    expect(stats.completedSetCount).toBe(2);
  });

  it("sums volume of completed sets without warm-ups (failed sets count)", () => {
    const stats = computeLiveWorkoutStats([
      benchPress([
        set("s1", { weightKg: 20, reps: 10, tag: "warmup" }),
        set("s2", { weightKg: 60, reps: 8 }),
        set("s3", { weightKg: 62.5, reps: 2, tag: "failed" }),
        set("s4", { weightKg: 100, reps: 10, isCompleted: false }),
      ]),
      tricepsPushdown([set("s5", { weightKg: null, reps: 12 })]),
    ]);
    expect(stats.totalVolumeKg).toBe(60 * 8 + 62.5 * 2);
  });

  it("lists muscles of exercises with a completed set; primary wins over secondary", () => {
    const stats = computeLiveWorkoutStats([
      benchPress([set("s1")]),
      tricepsPushdown([set("s2")]),
      { ...tricepsPushdown([set("s3", { isCompleted: false })]), id: "e3", primaryMuscles: ["biceps"] },
    ]);
    expect(stats.trainedMuscles).toEqual([
      { muscle: "chest", intensity: "primary" },
      { muscle: "triceps", intensity: "primary" },
      { muscle: "shoulders", intensity: "secondary" },
    ]);
  });
});

describe("getSetLabels", () => {
  it("numbers regular sets and shows R / D / NU for tagged ones", () => {
    const labels = getSetLabels([
      set("a", { tag: "warmup" }),
      set("b"),
      set("c", { tag: "drop_set" }),
      set("d"),
      set("e", { tag: "failed" }),
    ]);
    expect(labels).toEqual(["R", "1", "D", "2", "NU"]);
  });
});

describe("canCompleteSet", () => {
  it("requires reps; weight may be empty (bodyweight)", () => {
    expect(canCompleteSet(set("a", { reps: null }))).toBe(false);
    expect(canCompleteSet(set("a", { weightKg: null }))).toBe(true);
  });
});

describe("formatElapsed", () => {
  it.each([
    [0, "00:00"],
    [65, "01:05"],
    [3599, "59:59"],
    [3600, "1:00:00"],
    [3725, "1:02:05"],
    [-5, "00:00"],
  ])("formats %d s as %s", (seconds, expected) => {
    expect(formatElapsed(seconds)).toBe(expected);
  });
});

describe("formatKg", () => {
  it("formats volume in Polish notation", () => {
    expect(formatKg(0)).toBe("0 kg");
    expect(formatKg(605)).toBe("605 kg");
    expect(formatKg(12345.5)).toBe("12 345,5 kg");
  });
});

describe("computeVolumeKg", () => {
  it("skips warm-ups and treats an empty weight as 0 kg", () => {
    expect(
      computeVolumeKg([
        { weightKg: 20, reps: 10, tag: "warmup" },
        { weightKg: 50, reps: 10, tag: null },
        { weightKg: null, reps: 30, tag: null },
      ]),
    ).toBe(500);
  });
});

describe("formatEstimatedKg", () => {
  it("rounds estimates to 0,5 kg", () => {
    expect(formatEstimatedKg(96.25)).toBe("≈ 96,5 kg");
    expect(formatEstimatedKg(93.33)).toBe("≈ 93,5 kg");
    expect(formatEstimatedKg(100)).toBe("≈ 100 kg");
  });
});
