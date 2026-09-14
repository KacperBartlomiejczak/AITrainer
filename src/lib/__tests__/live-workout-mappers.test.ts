import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";
import type { LiveWorkoutExercise, LiveWorkoutSet } from "@/schemas/live-workout.schema";
import { NewUserRoutineSchema, NewWorkoutSessionSchema } from "@/schemas/workout-history.schema";
import {
  buildRoutineFromLiveWorkout,
  buildSessionFromLiveWorkout,
  createLiveExercise,
  createNextSet,
  formatRepsRange,
  getDefaultWorkoutTitle,
} from "../live-workout-mappers";

let counter = 0;
const createId = (prefix: string) => `${prefix}_${++counter}`;

const catalogBench: CatalogExercise = {
  id: "0025",
  name: "Wyciskanie sztangi na ławce poziomej",
  bodyPart: "chest",
  category: "chest",
  target: "Klatka piersiowa",
  equipment: "Sztanga",
  muscleGroup: "pectorals",
  secondaryMuscles: ["shoulders", "triceps"],
  instructionsPl: "Opis",
  imageFile: "images/0025.jpg",
  gifFile: "videos/0025.gif",
};

const set = (id: string, overrides: Partial<LiveWorkoutSet> = {}): LiveWorkoutSet => ({
  id,
  weightKg: 60,
  reps: 10,
  tag: null,
  isCompleted: true,
  ...overrides,
});

const liveExercise = (id: string, sets: LiveWorkoutSet[], catalogExerciseId = "0025"): LiveWorkoutExercise => ({
  id,
  catalogExerciseId,
  name: `Ćwiczenie ${catalogExerciseId}`,
  targetMuscle: "Klatka piersiowa",
  primaryMuscles: ["chest"],
  secondaryMuscles: [],
  sets,
});

beforeEach(() => {
  counter = 0;
});

describe("createLiveExercise", () => {
  it("creates an exercise with its ranking muscles and one empty set", () => {
    expect(createLiveExercise(catalogBench, createId)).toEqual({
      id: "lwe_1",
      catalogExerciseId: "0025",
      name: "Wyciskanie sztangi na ławce poziomej",
      targetMuscle: "Klatka piersiowa",
      primaryMuscles: ["chest"],
      secondaryMuscles: ["shoulders", "triceps"],
      sets: [{ id: "lws_2", weightKg: null, reps: null, tag: null, isCompleted: false }],
    });
  });

  it("returns null for an exercise without a known muscle group", () => {
    expect(
      createLiveExercise({ ...catalogBench, muscleGroup: "other", bodyPart: "cardio", secondaryMuscles: [] }, createId),
    ).toBeNull();
  });
});

describe("createNextSet", () => {
  it("copies weight and reps of the previous set, but not its tag or completion", () => {
    expect(createNextSet(set("s1", { tag: "warmup", weightKg: 40, reps: 12 }), createId)).toEqual({
      id: "lws_1",
      weightKg: 40,
      reps: 12,
      tag: null,
      isCompleted: false,
    });
    expect(createNextSet(undefined, createId)).toMatchObject({ weightKg: null, reps: null });
  });
});

describe("formatRepsRange", () => {
  it.each([
    [[10], "10"],
    [[8, 10, 8], "8–10"],
    [[], "—"],
  ])("formats %p as %s", (reps, expected) => {
    expect(formatRepsRange(reps)).toBe(expected);
  });
});

describe("getDefaultWorkoutTitle", () => {
  it("uses the Polish weekday", () => {
    expect(getDefaultWorkoutTitle(new Date(2026, 8, 15, 18))).toBe("Trening – wtorek");
  });
});

describe("buildSessionFromLiveWorkout", () => {
  const startedAt = new Date("2026-09-13T17:00:00.000Z");
  const completedAt = new Date("2026-09-13T18:00:00.000Z");

  it("stores completed sets only, with record flags, and marks exercises without completed sets as skipped", () => {
    const session = buildSessionFromLiveWorkout({
      exercises: [
        liveExercise("e1", [
          set("s1", { tag: "warmup", weightKg: 40 }),
          set("s2", { weightKg: 80, reps: 5 }),
          set("s3", { isCompleted: false }),
        ]),
        liveExercise("e2", [set("s4", { isCompleted: false })], "0034"),
      ],
      title: "  Push day  ",
      startedAt,
      completedAt,
      personalRecordHits: new Map([
        ["s2", ["one_rep_max", "best_set_volume"]],
        ["s3", ["one_rep_max"]], // not completed → never stored
      ]),
    });

    expect(NewWorkoutSessionSchema.safeParse(session).success).toBe(true);
    expect(session).toEqual({
      routineId: null,
      title: "Push day",
      startedAt,
      completedAt,
      exercises: [
        {
          catalogExerciseId: "0025",
          name: "Ćwiczenie 0025",
          targetMuscle: "Klatka piersiowa",
          sets: 2,
          targetReps: "5–10",
          completed: true,
          loggedSets: [
            { weightKg: 40, reps: 10, tag: "warmup", isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false },
            { weightKg: 80, reps: 5, tag: null, isOneRepMaxRecord: true, isBestSetVolumeRecord: true, isMaxRepsRecord: false },
          ],
        },
        {
          catalogExerciseId: "0034",
          name: "Ćwiczenie 0034",
          targetMuscle: "Klatka piersiowa",
          sets: 1,
          targetReps: "10",
          completed: false,
          loggedSets: [],
        },
      ],
    });
  });

  it("uses the default title when the user left it empty and stores empty weight as 0 kg", () => {
    const session = buildSessionFromLiveWorkout({
      exercises: [liveExercise("e1", [set("s1", { weightKg: null })])],
      title: "   ",
      startedAt,
      completedAt: new Date(2026, 8, 15, 18),
      personalRecordHits: new Map([["s1", ["max_reps"]]]),
    });
    expect(session.title).toBe("Trening – wtorek");
    expect(session.exercises[0]?.loggedSets?.[0]).toMatchObject({ weightKg: 0, isMaxRepsRecord: true });
  });
});

describe("buildRoutineFromLiveWorkout", () => {
  it("creates a user routine from exercises with completed sets, counting working sets only", () => {
    const routine = buildRoutineFromLiveWorkout({
      exercises: [
        liveExercise("e1", [set("s1", { tag: "warmup" }), set("s2", { reps: 8 }), set("s3", { reps: 12 })]),
        liveExercise("e2", [set("s4", { tag: "warmup" })], "0034"),
        liveExercise("e3", [set("s5", { isCompleted: false })], "0043"),
      ],
      title: "Push day",
      level: "intermediate",
      durationSeconds: 50 * 60,
      completedAt: new Date(2026, 8, 15, 18),
      createId,
    });

    expect(NewUserRoutineSchema.safeParse(routine).success).toBe(true);
    expect(routine).toEqual({
      id: "rtn_1",
      title: "Push day",
      description: "Rutyna zapisana z treningu 15.09.2026",
      level: "intermediate",
      daysPerWeek: 1,
      durationMinutes: 50,
      exercises: [
        { id: "rtx_2", name: "Ćwiczenie 0025", targetMuscle: "Klatka piersiowa", sets: 2, targetReps: "8–12", restSeconds: 90 },
        { id: "rtx_3", name: "Ćwiczenie 0034", targetMuscle: "Klatka piersiowa", sets: 1, targetReps: "10", restSeconds: 90 },
      ],
    });
  });

  it("keeps at least one minute of duration", () => {
    const routine = buildRoutineFromLiveWorkout({
      exercises: [liveExercise("e1", [set("s1")])],
      title: "Krótki",
      level: "beginner",
      durationSeconds: 5,
      completedAt: new Date(),
      createId,
    });
    expect(routine.durationMinutes).toBe(1);
  });
});
