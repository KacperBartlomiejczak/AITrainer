import {
  FinishWorkoutFormSchema,
  LiveWorkoutExerciseSchema,
  LiveWorkoutSessionSchema,
  LiveWorkoutSetPatchSchema,
  LiveWorkoutSetSchema,
  MAX_LIVE_WORKOUT_EXERCISES,
  PERSONAL_RECORD_META,
  PersonalBestSchema,
  RepsTextSchema,
  SET_TAG_META,
  WeightTextSchema,
  type LiveWorkoutExercise,
  type LiveWorkoutSet,
} from "../live-workout.schema";
import { PersonalRecordTypeSchema, SetTagSchema } from "../workout-history.schema";

const set: LiveWorkoutSet = { id: "set_1", weightKg: 60, reps: 10, tag: null, isCompleted: true };

const exercise: LiveWorkoutExercise = {
  id: "lwe_1",
  catalogExerciseId: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  targetMuscle: "Klatka piersiowa",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["shoulders", "triceps"],
  sets: [set],
};

describe("SET_TAG_META", () => {
  it("labels warm-up as R, drop set as D and failed as NU", () => {
    expect(SetTagSchema.options.map((tag) => SET_TAG_META[tag].short)).toEqual(["R", "D", "NU"]);
  });
});

describe("LiveWorkoutSetSchema", () => {
  it("accepts an empty, not yet typed set", () => {
    expect(
      LiveWorkoutSetSchema.safeParse({ id: "s", weightKg: null, reps: null, tag: null, isCompleted: false }).success,
    ).toBe(true);
  });

  it("accepts a bodyweight set (0 kg)", () => {
    expect(LiveWorkoutSetSchema.safeParse({ ...set, weightKg: 0 }).success).toBe(true);
  });

  it.each([
    { weightKg: -5 },
    { weightKg: 1001 },
    { reps: 0 },
    { reps: 2.5 },
    { tag: "personal_record" },
  ])("rejects invalid values %p", (override) => {
    expect(LiveWorkoutSetSchema.safeParse({ ...set, ...override }).success).toBe(false);
  });
});

describe("LiveWorkoutExerciseSchema", () => {
  it("accepts a catalog exercise with sets", () => {
    expect(LiveWorkoutExerciseSchema.safeParse(exercise).success).toBe(true);
  });

  it("requires at least one set and one primary muscle", () => {
    expect(LiveWorkoutExerciseSchema.safeParse({ ...exercise, sets: [] }).success).toBe(false);
    expect(LiveWorkoutExerciseSchema.safeParse({ ...exercise, primaryMuscles: [] }).success).toBe(false);
  });

  it("caps sets per exercise at 20", () => {
    const sets = Array.from({ length: 21 }, (_, index) => ({ ...set, id: `s${index}` }));
    expect(LiveWorkoutExerciseSchema.safeParse({ ...exercise, sets }).success).toBe(false);
  });

  it("rejects unknown muscle groups", () => {
    expect(LiveWorkoutExerciseSchema.safeParse({ ...exercise, primaryMuscles: ["pectorals"] }).success).toBe(false);
  });
});

describe("LiveWorkoutSessionSchema", () => {
  it("accepts an empty workout that was just started", () => {
    expect(LiveWorkoutSessionSchema.safeParse({ startedAt: Date.now(), exercises: [] }).success).toBe(true);
  });

  it("caps the number of exercises", () => {
    const exercises = Array.from({ length: MAX_LIVE_WORKOUT_EXERCISES + 1 }, (_, index) => ({
      ...exercise,
      id: `e${index}`,
    }));
    expect(LiveWorkoutSessionSchema.safeParse({ startedAt: Date.now(), exercises }).success).toBe(false);
  });
});

describe("LiveWorkoutSetPatchSchema", () => {
  it("accepts a partial update and rejects the id", () => {
    expect(LiveWorkoutSetPatchSchema.safeParse({ reps: 8 }).success).toBe(true);
    expect(LiveWorkoutSetPatchSchema.parse({ id: "x", reps: 8 })).toEqual({ reps: 8 });
  });
});

describe("WeightTextSchema", () => {
  it.each([
    ["60", 60],
    ["62,5", 62.5],
    [" 62.5 ", 62.5],
    ["0", 0],
  ])("parses %s as %d kg", (text, expected) => {
    expect(WeightTextSchema.safeParse(text)).toEqual({ success: true, data: expected });
  });

  it.each(["", "abc", "-5", "1,234", "5000", "12kg"])("rejects %p", (text) => {
    expect(WeightTextSchema.safeParse(text).success).toBe(false);
  });
});

describe("RepsTextSchema", () => {
  it("parses whole reps", () => {
    expect(RepsTextSchema.safeParse("8")).toEqual({ success: true, data: 8 });
  });

  it.each(["", "0", "8.5", "abc", "1000"])("rejects %p", (text) => {
    expect(RepsTextSchema.safeParse(text).success).toBe(false);
  });
});

describe("FinishWorkoutFormSchema", () => {
  it("accepts an empty title (a default one is generated) and no photo", () => {
    expect(FinishWorkoutFormSchema.safeParse({ title: "", saveAsRoutine: false, photoUri: null }).success).toBe(true);
  });

  it("trims the title and rejects titles over 120 characters", () => {
    expect(FinishWorkoutFormSchema.parse({ title: "  Push  ", saveAsRoutine: true, photoUri: null }).title).toBe("Push");
    const result = FinishWorkoutFormSchema.safeParse({ title: "a".repeat(121), saveAsRoutine: false, photoUri: null });
    expect(result.error?.issues[0]?.message).toBe("Nazwa treningu jest za długa");
  });
});

describe("PERSONAL_RECORD_META", () => {
  it("labels 1RM as MAX, set volume as SERIA and most reps as POWT.", () => {
    expect(PersonalRecordTypeSchema.options.map((type) => PERSONAL_RECORD_META[type].short)).toEqual([
      "MAX",
      "SERIA",
      "POWT.",
    ]);
  });
});

describe("PersonalBestSchema", () => {
  it("allows missing bests per record type (no such sets in the history)", () => {
    expect(
      PersonalBestSchema.safeParse({ catalogExerciseId: "0033", oneRepMaxKg: null, bestSetVolumeKg: null, maxReps: 25 })
        .success,
    ).toBe(true);
  });

  it("rejects negative bests and fractional reps", () => {
    const best = { catalogExerciseId: "0025", oneRepMaxKg: 100, bestSetVolumeKg: 800, maxReps: null };
    expect(PersonalBestSchema.safeParse({ ...best, oneRepMaxKg: -1 }).success).toBe(false);
    expect(PersonalBestSchema.safeParse({ ...best, maxReps: 2.5 }).success).toBe(false);
  });
});
