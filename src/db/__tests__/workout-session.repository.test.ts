import { createOnboardingRepository } from "../repositories/onboarding.repository";
import { createRoutineRepository } from "../repositories/routine.repository";
import { createWorkoutSessionRepository } from "../repositories/workout-session.repository";
import { BUILTIN_ROUTINES } from "../seeds/builtin-routines";
import { createTestDatabase, type TestDatabase } from "../testing/create-test-database";
import type { NewWorkoutSession, SetTag } from "@/schemas/workout-history.schema";

const ROUTINE_ID = BUILTIN_ROUTINES[0]?.id ?? "";

function buildSession(overrides: Partial<NewWorkoutSession> = {}): NewWorkoutSession {
  return {
    routineId: ROUTINE_ID,
    title: "FBW A — Całe ciało",
    startedAt: new Date("2026-09-13T17:00:00.000Z"),
    completedAt: new Date("2026-09-13T17:45:30.000Z"),
    exercises: [
      { name: "Przysiad", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true },
      { name: "Plank", targetMuscle: "Brzuch", sets: 3, targetReps: "45 sek", completed: false },
    ],
    ...overrides,
  };
}

describe("createWorkoutSessionRepository", () => {
  let testDb: TestDatabase;
  let idCounter: number;
  const createId = (prefix: string) => `${prefix}_${++idCounter}`;
  const now = () => new Date("2026-09-13T18:00:00.000Z");

  beforeEach(async () => {
    testDb = createTestDatabase();
    idCounter = 0;
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    await createRoutineRepository(testDb.db, { now }).seed(BUILTIN_ROUTINES);
    await createOnboardingRepository(testDb.db, { now }).save({
      name: "Kacper",
      experienceLevel: "beginner",
      fitnessGoal: "strength",
      muscleFocus: { mode: "undecided" },
    });
  });

  afterEach(() => {
    testDb.close();
    jest.restoreAllMocks();
  });

  const createRepository = () => createWorkoutSessionRepository(testDb.db, { now, createId });

  it("saves a finished workout with a snapshot of its exercises and no photo", async () => {
    const repository = createRepository();
    const saved = await repository.save(buildSession());

    expect(saved).toMatchObject({
      id: "wks_1",
      routineId: ROUTINE_ID,
      title: "FBW A — Całe ciało",
      durationSeconds: 2730,
      photoFileName: null,
      createdAt: now(),
    });
    expect(saved.exercises.map((exercise) => [exercise.name, exercise.completed])).toEqual([
      ["Przysiad", true],
      ["Plank", false],
    ]);
    await expect(repository.list()).resolves.toEqual([saved]);
  });

  it("lists sessions newest first", async () => {
    const repository = createRepository();
    const older = await repository.save(
      buildSession({
        title: "Starszy",
        startedAt: new Date("2026-09-10T17:00:00.000Z"),
        completedAt: new Date("2026-09-10T18:00:00.000Z"),
      }),
    );
    const newer = await repository.save(buildSession({ title: "Nowszy" }));

    const sessions = await repository.list();
    expect(sessions.map((session) => session.id)).toEqual([newer.id, older.id]);
  });

  it("rejects a workout without completed exercises", async () => {
    const repository = createRepository();
    const session = buildSession();
    await expect(
      repository.save({
        ...session,
        exercises: session.exercises.map((exercise) => ({ ...exercise, completed: false })),
      }),
    ).rejects.toThrow();
    await expect(repository.list()).resolves.toEqual([]);
  });

  it("attaches, replaces and removes the optional photo, returning the previous file", async () => {
    const repository = createRepository();
    const { id } = await repository.save(buildSession());

    await expect(repository.setPhoto(id, "wks_1-100.jpg")).resolves.toBeNull();
    await expect(repository.setPhoto(id, "wks_1-200.jpg")).resolves.toBe("wks_1-100.jpg");
    expect((await repository.list())[0]?.photoFileName).toBe("wks_1-200.jpg");

    await expect(repository.setPhoto(id, null)).resolves.toBe("wks_1-200.jpg");
    expect((await repository.list())[0]?.photoFileName).toBeNull();
  });

  it("rejects an unsafe photo file name and an unknown session", async () => {
    const repository = createRepository();
    const { id } = await repository.save(buildSession());

    await expect(repository.setPhoto(id, "../outside.jpg")).rejects.toThrow();
    await expect(repository.setPhoto("missing", "a.jpg")).rejects.toThrow();
  });

  it("keeps history when the routine is deleted (routine_id becomes null)", async () => {
    const repository = createRepository();
    await repository.save(buildSession());
    testDb.sqlite.prepare("DELETE FROM routines WHERE id = ?").run(ROUTINE_ID);

    const [session] = await repository.list();
    expect(session?.routineId).toBeNull();
    expect(session?.exercises).toHaveLength(2);
  });

  it("clears all sessions and their exercises for the user", async () => {
    const repository = createRepository();
    await repository.save(buildSession());
    await repository.clearAll();

    await expect(repository.list()).resolves.toEqual([]);
    const { count } = testDb.sqlite.prepare("SELECT COUNT(*) AS count FROM workout_session_exercises").get() as {
      count: number;
    };
    expect(count).toBe(0);
  });

  it("deletes sessions together with the user profile (cascade)", async () => {
    const repository = createRepository();
    await repository.save(buildSession());
    await createOnboardingRepository(testDb.db).clear();

    await expect(repository.list()).resolves.toEqual([]);
  });

  it("saves logged sets in order with tags and PR flags, and lists them back", async () => {
    const repository = createRepository();
    const saved = await repository.save(
      buildSession({
        routineId: null,
        exercises: [
          {
            name: "Wyciskanie sztangi",
            targetMuscle: "Klatka piersiowa",
            sets: 2,
            targetReps: "5–10",
            completed: true,
            catalogExerciseId: "0025",
            loggedSets: [
              { weightKg: 40, reps: 10, tag: "warmup", isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false },
              { weightKg: 82.5, reps: 5, tag: null, isOneRepMaxRecord: true, isBestSetVolumeRecord: true, isMaxRepsRecord: false },
            ],
          },
        ],
      }),
    );

    const [listed] = await repository.list();
    expect(listed).toEqual(saved);
    expect(listed?.exercises[0]?.catalogExerciseId).toBe("0025");
    expect(
      listed?.exercises[0]?.loggedSets.map((set) => [
        set.weightKg,
        set.reps,
        set.tag,
        set.isOneRepMaxRecord,
        set.isBestSetVolumeRecord,
        set.isMaxRepsRecord,
      ]),
    ).toEqual([
      [40, 10, "warmup", false, false, false],
      [82.5, 5, null, true, true, false],
    ]);
  });

  it("lists routine workouts (no logged sets) with an empty set list", async () => {
    const repository = createRepository();
    await repository.save(buildSession());

    const [session] = await repository.list();
    expect(session?.exercises.map((exercise) => [exercise.catalogExerciseId, exercise.loggedSets])).toEqual([
      [null, []],
      [null, []],
    ]);
  });

  it("returns 1RM, best set volume and most reps per catalog exercise, ignoring warm-ups and failed sets", async () => {
    const repository = createRepository();
    const noRecords = { isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false };
    const exercise = (catalogExerciseId: string, sets: { weightKg: number; reps: number; tag: SetTag | null }[]) => ({
      name: `Ćwiczenie ${catalogExerciseId}`,
      targetMuscle: "Klatka",
      sets: sets.length,
      targetReps: "5",
      completed: true,
      catalogExerciseId,
      loggedSets: sets.map((set) => ({ ...set, ...noRecords })),
    });
    await repository.save(
      buildSession({
        exercises: [
          exercise("0025", [
            { weightKg: 120, reps: 1, tag: "failed" },
            { weightKg: 150, reps: 3, tag: "warmup" },
            { weightKg: 90, reps: 1, tag: null },
          ]),
          exercise("0033", [
            { weightKg: 0, reps: 25, tag: null },
            { weightKg: 0, reps: 40, tag: "warmup" },
          ]),
          exercise("0045", [{ weightKg: 100, reps: 5, tag: "warmup" }]),
        ],
      }),
    );
    await repository.save(buildSession({ exercises: [exercise("0025", [{ weightKg: 70, reps: 10, tag: "drop_set" }])] }));

    await expect(repository.getPersonalBests(["0025", "0033", "0045", "9999"])).resolves.toEqual([
      // 1RM: 70 × 10 ≈ 93.33 kg beats 90 × 1; best set: 70 × 10 = 700 kg
      { catalogExerciseId: "0025", oneRepMaxKg: 93.33, bestSetVolumeKg: 700, maxReps: null },
      { catalogExerciseId: "0033", oneRepMaxKg: null, bestSetVolumeKg: null, maxReps: 25 },
    ]);
    await expect(repository.getPersonalBests([])).resolves.toEqual([]);
  });

  it("returns no bests for a user without any workouts", async () => {
    await expect(createRepository().getPersonalBests(["0025"])).resolves.toEqual([]);
  });

  it("returns exercise progress per saved workout for the user, oldest first", async () => {
    const repository = createRepository();
    const noRecords = { isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false };
    const benchPress = (sets: { weightKg: number; reps: number; tag: SetTag | null }[]) => ({
      name: "Wyciskanie",
      targetMuscle: "Klatka",
      sets: sets.length,
      targetReps: "5",
      completed: true,
      catalogExerciseId: "0025",
      loggedSets: sets.map((set) => ({ ...set, ...noRecords })),
    });
    await repository.save(
      buildSession({
        startedAt: new Date("2026-09-12T17:00:00.000Z"),
        completedAt: new Date("2026-09-12T18:00:00.000Z"),
        exercises: [benchPress([{ weightKg: 85, reps: 3, tag: null }])],
      }),
    );
    await repository.save(
      buildSession({
        startedAt: new Date("2026-09-10T17:00:00.000Z"),
        completedAt: new Date("2026-09-10T18:00:00.000Z"),
        exercises: [benchPress([{ weightKg: 40, reps: 10, tag: "warmup" }, { weightKg: 80, reps: 5, tag: null }])],
      }),
    );

    const progress = await repository.getExerciseProgress("0025");
    expect(progress.points.map((point) => [point.completedAt.toISOString(), point.oneRepMaxKg])).toEqual([
      ["2026-09-10T18:00:00.000Z", 93.33],
      ["2026-09-12T18:00:00.000Z", 93.5],
    ]);
    expect(progress.summary).toMatchObject({ heaviestSet: { weightKg: 85, reps: 3 }, workoutCount: 2 });
    await expect(repository.getExerciseProgress("9999")).resolves.toMatchObject({ points: [], summary: { workoutCount: 0 } });
  });

  it("deletes logged sets together with the history", async () => {
    const repository = createRepository();
    await repository.save(
      buildSession({
        exercises: [
          {
            name: "Przysiad",
            targetMuscle: "Nogi",
            sets: 1,
            targetReps: "5",
            completed: true,
            catalogExerciseId: "0043",
            loggedSets: [{ weightKg: 100, reps: 5, tag: null, isOneRepMaxRecord: false, isBestSetVolumeRecord: false, isMaxRepsRecord: false }],
          },
        ],
      }),
    );
    await repository.clearAll();

    expect(testDb.sqlite.prepare("SELECT COUNT(*) AS count FROM workout_session_sets").get()).toEqual({ count: 0 });
    await expect(repository.getPersonalBests(["0043"])).resolves.toEqual([]);
  });

  it("skips a corrupted session row instead of crashing", async () => {
    const repository = createRepository();
    const broken = await repository.save(buildSession({ title: "Zepsuty" }));
    const valid = await repository.save(buildSession({ title: "Poprawny" }));
    testDb.sqlite.prepare("UPDATE workout_sessions SET photo_file_name = '../x.jpg' WHERE id = ?").run(broken.id);

    const sessions = await repository.list();
    expect(sessions.map((session) => session.id)).toEqual([valid.id]);
    expect(console.warn).toHaveBeenCalled();
  });
});
