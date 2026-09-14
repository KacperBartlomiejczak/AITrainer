import type { LiveWorkoutExercise, LiveWorkoutSet, PersonalBest } from "@/schemas/live-workout.schema";
import {
  computePersonalBest,
  countPersonalRecords,
  estimateOneRepMaxKg,
  findPersonalRecordHits,
  isBetterSet,
} from "../personal-records";

const set = (id: string, overrides: Partial<LiveWorkoutSet> = {}): LiveWorkoutSet => ({
  id,
  weightKg: 60,
  reps: 10,
  tag: null,
  isCompleted: true,
  ...overrides,
});

const exercise = (id: string, sets: LiveWorkoutSet[], catalogExerciseId = "0025"): LiveWorkoutExercise => ({
  id,
  catalogExerciseId,
  name: "Wyciskanie",
  targetMuscle: "Klatka",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  sets,
});

const best = (overrides: Partial<PersonalBest> = {}): PersonalBest => ({
  catalogExerciseId: "0025",
  oneRepMaxKg: estimateOneRepMaxKg(80, 5),
  bestSetVolumeKg: 600,
  maxReps: null,
  ...overrides,
});

describe("estimateOneRepMaxKg", () => {
  it("uses the lifted weight for a single rep and the Epley formula otherwise", () => {
    expect(estimateOneRepMaxKg(100, 1)).toBe(100);
    expect(estimateOneRepMaxKg(80, 10)).toBeCloseTo(106.67, 2);
    expect(estimateOneRepMaxKg(60, 5)).toBe(70);
  });
});

describe("isBetterSet", () => {
  it("prefers heavier weight, then more reps at the same weight", () => {
    expect(isBetterSet({ weightKg: 62.5, reps: 1 }, { weightKg: 60, reps: 10 })).toBe(true);
    expect(isBetterSet({ weightKg: 60, reps: 11 }, { weightKg: 60, reps: 10 })).toBe(true);
    expect(isBetterSet({ weightKg: 60, reps: 10 }, { weightKg: 60, reps: 10 })).toBe(false);
  });
});

describe("computePersonalBest", () => {
  it("returns null when the history has no counted set (first time / only warm-ups and failed sets)", () => {
    expect(computePersonalBest("0025", [])).toBeNull();
    expect(
      computePersonalBest("0025", [
        { weightKg: 100, reps: 5, tag: "warmup" },
        { weightKg: 120, reps: 1, tag: "failed" },
      ]),
    ).toBeNull();
  });

  it("takes the best 1RM and set volume from weighted sets and the most reps from bodyweight sets", () => {
    expect(
      computePersonalBest("0025", [
        { weightKg: 100, reps: 1, tag: null },
        { weightKg: 80, reps: 10, tag: "drop_set" },
        { weightKg: 150, reps: 10, tag: "warmup" },
        { weightKg: 0, reps: 25, tag: null },
      ]),
    ).toEqual({
      catalogExerciseId: "0025",
      oneRepMaxKg: 106.67, // rounded to 0.01 kg, like every compared value
      bestSetVolumeKg: 800,
      maxReps: 25,
    });
  });

  it("keeps a record type null when there are no sets of that kind", () => {
    expect(computePersonalBest("0033", [{ weightKg: 0, reps: 20, tag: null }])).toEqual({
      catalogExerciseId: "0033",
      oneRepMaxKg: null,
      bestSetVolumeKg: null,
      maxReps: 20,
    });
  });
});

describe("findPersonalRecordHits", () => {
  it("shows no record for a new user or an exercise done for the first time", () => {
    const exercises = [exercise("e1", [set("s1", { weightKg: 200, reps: 10 }), set("s2", { weightKg: 0, reps: 50 })])];
    expect(findPersonalRecordHits(exercises, [])).toEqual(new Map());
    expect(findPersonalRecordHits(exercises, [best({ catalogExerciseId: "0034" })])).toEqual(new Map());
  });

  it("marks the best 1RM set as MAX and the best volume set as SERIA — possibly different sets", () => {
    // history: 80 × 5 → 1RM ≈ 93.3 kg, best set 600 kg
    const exercises = [
      exercise("e1", [
        set("heavy", { weightKg: 90, reps: 3 }), // 1RM 99 kg, volume 270 kg
        set("volume", { weightKg: 65, reps: 10 }), // 1RM ≈ 86.7 kg, volume 650 kg
      ]),
    ];
    expect(findPersonalRecordHits(exercises, [best()])).toEqual(
      new Map([
        ["heavy", ["one_rep_max"]],
        ["volume", ["best_set_volume"]],
      ]),
    );
  });

  it("lets one set beat both records", () => {
    const exercises = [exercise("e1", [set("s1", { weightKg: 85, reps: 8 })])];
    expect(findPersonalRecordHits(exercises, [best()])).toEqual(new Map([["s1", ["one_rep_max", "best_set_volume"]]]));
  });

  it("requires a strictly better result — equal to the record is not a record", () => {
    const exercises = [exercise("e1", [set("s1", { weightKg: 80, reps: 5 }), set("s2", { weightKg: 60, reps: 10 })])];
    expect(findPersonalRecordHits(exercises, [best()])).toEqual(new Map());
  });

  it("gives the record to the first of two equally good sets", () => {
    const exercises = [exercise("e1", [set("s1", { weightKg: 100, reps: 1 }), set("s2", { weightKg: 100, reps: 1 })])];
    expect(findPersonalRecordHits(exercises, [best()]).get("s1")).toEqual(["one_rep_max"]);
    expect(findPersonalRecordHits(exercises, [best()]).has("s2")).toBe(false);
  });

  it("ignores sets that are not completed, warm-ups, failed sets and sets without reps; drop sets count", () => {
    const exercises = [
      exercise("e1", [
        set("s1", { weightKg: 100, isCompleted: false }),
        set("s2", { weightKg: 100, tag: "warmup" }),
        set("s3", { weightKg: 100, tag: "failed" }),
        set("s4", { weightKg: 100, reps: null }),
        set("s5", { weightKg: 70, reps: 10, tag: "drop_set" }),
      ]),
    ];
    expect(findPersonalRecordHits(exercises, [best()])).toEqual(new Map([["s5", ["best_set_volume"]]]));
  });

  it("uses most reps for bodyweight sets (0 kg or empty weight) only", () => {
    const pushUps = [exercise("e1", [set("s1", { weightKg: null, reps: 26 }), set("s2", { weightKg: 0, reps: 30 })], "0033")];
    const history = best({ catalogExerciseId: "0033", oneRepMaxKg: null, bestSetVolumeKg: null, maxReps: 25 });

    expect(findPersonalRecordHits(pushUps, [history])).toEqual(new Map([["s2", ["max_reps"]]]));
  });

  it("gives no most-reps record when the history has only weighted sets of that exercise", () => {
    const pushUps = [exercise("e1", [set("s1", { weightKg: 0, reps: 40 })], "0033")];
    expect(findPersonalRecordHits(pushUps, [best({ catalogExerciseId: "0033", maxReps: null })])).toEqual(new Map());
  });

  it("picks one record per type per catalog exercise even when the exercise was added twice", () => {
    const exercises = [exercise("e1", [set("s1", { weightKg: 90, reps: 1 })]), exercise("e2", [set("s2", { weightKg: 95, reps: 1 })])];
    expect(findPersonalRecordHits(exercises, [best({ bestSetVolumeKg: 1000 })])).toEqual(new Map([["s2", ["one_rep_max"]]]));
  });
});

describe("countPersonalRecords", () => {
  it("counts every record type separately", () => {
    expect(
      countPersonalRecords(
        new Map([
          ["s1", ["one_rep_max", "best_set_volume"]],
          ["s2", ["max_reps"]],
        ]),
      ),
    ).toBe(3);
  });
});
