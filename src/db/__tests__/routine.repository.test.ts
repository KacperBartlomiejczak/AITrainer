import { createOnboardingRepository } from "../repositories/onboarding.repository";
import { createRoutineRepository } from "../repositories/routine.repository";
import { BUILTIN_ROUTINES } from "../seeds/builtin-routines";
import { createTestDatabase, type TestDatabase } from "../testing/create-test-database";
import { LOCAL_USER_ID } from "@/schemas/database.schema";
import { NewRoutineSchema, NewUserRoutineSchema, type NewRoutine } from "@/schemas/workout-history.schema";

const customRoutine: NewRoutine = {
  id: "rtn_custom",
  userId: null,
  title: "Własna rutyna",
  description: "Testowa rutyna",
  level: "intermediate",
  daysPerWeek: 2,
  durationMinutes: 30,
  exercises: [
    { id: "rtn_custom_ex_2", name: "Pompki", targetMuscle: "Klatka", sets: 3, targetReps: "10", restSeconds: 60 },
    { id: "rtn_custom_ex_1", name: "Przysiad", targetMuscle: "Nogi", sets: 4, targetReps: "12", restSeconds: 90 },
  ],
};

describe("BUILTIN_ROUTINES", () => {
  it("ships exactly two basic, valid routines with unique ids", () => {
    expect(BUILTIN_ROUTINES).toHaveLength(2);
    for (const routine of BUILTIN_ROUTINES) {
      expect(NewRoutineSchema.safeParse(routine).success).toBe(true);
      expect(routine.userId).toBeNull();
      expect(routine.level).toBe("beginner");
    }
    const exerciseIds = BUILTIN_ROUTINES.flatMap((routine) => routine.exercises.map((exercise) => exercise.id));
    expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
    expect(new Set(BUILTIN_ROUTINES.map((routine) => routine.id)).size).toBe(2);
  });
});

describe("createRoutineRepository", () => {
  let testDb: TestDatabase;
  const now = () => new Date("2026-09-13T10:00:00.000Z");

  beforeEach(() => {
    testDb = createTestDatabase();
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    testDb.close();
    jest.restoreAllMocks();
  });

  it("returns an empty list before seeding", async () => {
    const repository = createRoutineRepository(testDb.db, { now });
    await expect(repository.list()).resolves.toEqual([]);
  });

  it("seeds built-in routines with exercises in their original order", async () => {
    const repository = createRoutineRepository(testDb.db, { now });
    await repository.seed(BUILTIN_ROUTINES);

    const routines = await repository.list();
    expect(routines.map((routine) => routine.id)).toEqual(BUILTIN_ROUTINES.map((routine) => routine.id));
    expect(routines[0]?.exercises.map((exercise) => exercise.id)).toEqual(
      BUILTIN_ROUTINES[0]?.exercises.map((exercise) => exercise.id),
    );
    expect(routines[0]?.createdAt).toEqual(now());
  });

  it("keeps exercise order as defined, not alphabetical by id", async () => {
    const repository = createRoutineRepository(testDb.db, { now });
    await repository.seed([customRoutine]);

    const routine = await repository.getById("rtn_custom");
    expect(routine?.exercises.map((exercise) => exercise.name)).toEqual(["Pompki", "Przysiad"]);
  });

  it("is idempotent when seeding repeatedly", async () => {
    const repository = createRoutineRepository(testDb.db, { now });
    await repository.seed(BUILTIN_ROUTINES);
    await repository.seed(BUILTIN_ROUTINES);

    expect(await repository.list()).toHaveLength(2);
    const { count } = testDb.sqlite.prepare("SELECT COUNT(*) AS count FROM routine_exercises").get() as {
      count: number;
    };
    expect(count).toBe(BUILTIN_ROUTINES.reduce((sum, routine) => sum + routine.exercises.length, 0));
  });

  it("returns null for an unknown routine id", async () => {
    const repository = createRoutineRepository(testDb.db, { now });
    await expect(repository.getById("missing")).resolves.toBeNull();
  });

  it("rejects invalid routine definitions without writing anything", async () => {
    const repository = createRoutineRepository(testDb.db, { now });
    await expect(repository.seed([{ ...customRoutine, daysPerWeek: 9 }])).rejects.toThrow();
    expect(await repository.list()).toEqual([]);
  });

  it("creates a routine owned by the repository user and lists it after built-in ones", async () => {
    await createOnboardingRepository(testDb.db, { now }).save({
      name: "Kacper",
      experienceLevel: "beginner",
      fitnessGoal: "strength",
      muscleFocus: { mode: "undecided" },
    });
    const repository = createRoutineRepository(testDb.db, { now });
    await repository.seed(BUILTIN_ROUTINES);

    // Zod strips `userId`: the owner always comes from the repository
    const definition = NewUserRoutineSchema.parse(customRoutine);
    const created = await repository.create(definition);

    expect(created).toMatchObject({ id: "rtn_custom", userId: LOCAL_USER_ID, createdAt: now() });
    expect(created.exercises.map((exercise) => exercise.name)).toEqual(["Pompki", "Przysiad"]);
    const routines = await repository.list();
    expect(routines.map((routine) => routine.id)).toContain("rtn_custom");
    await expect(repository.getById("rtn_custom")).resolves.toEqual(created);
  });

  it("rejects an invalid user routine without writing anything", async () => {
    const repository = createRoutineRepository(testDb.db, { now });
    const definition = NewUserRoutineSchema.parse(customRoutine);
    await expect(repository.create({ ...definition, exercises: [] })).rejects.toThrow();
    await expect(repository.list()).resolves.toEqual([]);
  });

  it("skips corrupted routine rows instead of crashing", async () => {
    const repository = createRoutineRepository(testDb.db, { now });
    await repository.seed(BUILTIN_ROUTINES);
    testDb.sqlite.prepare("UPDATE routines SET level = 'godlike' WHERE id = ?").run(BUILTIN_ROUTINES[0]?.id);

    const routines = await repository.list();
    expect(routines.map((routine) => routine.id)).toEqual([BUILTIN_ROUTINES[1]?.id]);
    expect(console.warn).toHaveBeenCalled();
  });
});
