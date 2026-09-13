import { createOnboardingRepository } from "../repositories/onboarding.repository";
import { createRoutineRepository } from "../repositories/routine.repository";
import { createWorkoutSessionRepository } from "../repositories/workout-session.repository";
import { BUILTIN_ROUTINES } from "../seeds/builtin-routines";
import { createTestDatabase, type TestDatabase } from "../testing/create-test-database";
import type { NewWorkoutSession } from "@/schemas/workout-history.schema";

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
