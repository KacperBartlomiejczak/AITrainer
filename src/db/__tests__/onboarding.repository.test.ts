import { createOnboardingRepository } from "../repositories/onboarding.repository";
import { createTestDatabase, type TestDatabase } from "../testing/create-test-database";
import { userFocusMuscleGroups, userProfiles } from "../schema";
import { LOCAL_USER_ID } from "@/schemas/database.schema";
import type { OnboardingFormData } from "@/schemas/onboarding.schema";

const onboarding: OnboardingFormData = {
  name: "Kacper",
  experienceLevel: "intermediate",
  fitnessGoal: "muscle_gain",
  muscleFocus: { mode: "selected", muscleGroups: ["legs", "chest"] },
};

const undecidedOnboarding: OnboardingFormData = {
  name: "Ola",
  experienceLevel: "beginner",
  fitnessGoal: "weight_loss",
  muscleFocus: { mode: "undecided" },
};

describe("createOnboardingRepository", () => {
  let testDb: TestDatabase;
  let currentTime: Date;
  const now = () => currentTime;

  const insertRawProfile = (overrides: { experienceLevel?: string; fitnessGoal?: string; mode?: string }) => {
    const ts = currentTime.getTime();
    testDb.sqlite
      .prepare(
        `INSERT INTO user_profiles
          (id, name, experience_level, fitness_goal, muscle_focus_mode, onboarding_completed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        LOCAL_USER_ID,
        "Kacper",
        overrides.experienceLevel ?? "beginner",
        overrides.fitnessGoal ?? "strength",
        overrides.mode ?? "selected",
        ts,
        ts,
        ts,
      );
  };

  beforeEach(() => {
    testDb = createTestDatabase();
    currentTime = new Date("2026-09-13T10:00:00.000Z");
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    testDb.close();
    jest.restoreAllMocks();
  });

  it("returns null when nothing has been saved", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    await expect(repository.load()).resolves.toBeNull();
  });

  it("round-trips completed onboarding data (muscle groups in canonical order)", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });

    await repository.save(onboarding);

    await expect(repository.load()).resolves.toEqual({
      ...onboarding,
      muscleFocus: { mode: "selected", muscleGroups: ["chest", "legs"] },
    });
  });

  it("round-trips 'not sure yet' without muscle group rows", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });

    await repository.save(undecidedOnboarding);

    await expect(repository.load()).resolves.toEqual(undecidedOnboarding);
    expect(await testDb.db.select().from(userFocusMuscleGroups)).toHaveLength(0);
  });

  it("stores snake_case rows with timestamps for the local user", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    await repository.save(onboarding);

    const rawProfile = testDb.sqlite.prepare("SELECT * FROM user_profiles").get();
    expect(rawProfile).toEqual({
      id: LOCAL_USER_ID,
      name: "Kacper",
      experience_level: "intermediate",
      fitness_goal: "muscle_gain",
      muscle_focus_mode: "selected",
      onboarding_completed_at: currentTime.getTime(),
      created_at: currentTime.getTime(),
      updated_at: currentTime.getTime(),
    });
  });

  it("updates an existing profile, keeping created/completed timestamps", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    const firstSave = currentTime;
    await repository.save(onboarding);

    currentTime = new Date("2026-09-14T10:00:00.000Z");
    const updated: OnboardingFormData = {
      name: "Kacper Pro",
      experienceLevel: "advanced",
      fitnessGoal: "strength",
      muscleFocus: { mode: "selected", muscleGroups: ["back"] },
    };
    await repository.save(updated);

    await expect(repository.load()).resolves.toEqual(updated);

    const [profile] = await testDb.db.select().from(userProfiles);
    expect(profile.createdAt).toEqual(firstSave);
    expect(profile.onboardingCompletedAt).toEqual(firstSave);
    expect(profile.updatedAt).toEqual(currentTime);
  });

  it("switching to 'not sure yet' removes previously selected muscle groups", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    await repository.save(onboarding);

    await repository.save({ ...onboarding, muscleFocus: { mode: "undecided" } });

    await expect(repository.load()).resolves.toEqual({ ...onboarding, muscleFocus: { mode: "undecided" } });
    expect(await testDb.db.select().from(userFocusMuscleGroups)).toHaveLength(0);
  });

  it("deduplicates repeated muscle groups", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    await repository.save({ ...onboarding, muscleFocus: { mode: "selected", muscleGroups: ["abs", "abs"] } });

    await expect(repository.load()).resolves.toEqual({
      ...onboarding,
      muscleFocus: { mode: "selected", muscleGroups: ["abs"] },
    });
  });

  it("rejects invalid data and writes nothing", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    const invalid: OnboardingFormData = { ...onboarding, name: "" };

    await expect(repository.save(invalid)).rejects.toThrow();

    expect(await testDb.db.select().from(userProfiles)).toHaveLength(0);
    expect(await testDb.db.select().from(userFocusMuscleGroups)).toHaveLength(0);
  });

  it("clear() deletes the profile and its muscle groups", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    await repository.save(onboarding);

    await repository.clear();

    await expect(repository.load()).resolves.toBeNull();
    expect(await testDb.db.select().from(userFocusMuscleGroups)).toHaveLength(0);
  });

  it("keeps data isolated per user id", async () => {
    const local = createOnboardingRepository(testDb.db, { now });
    const other = createOnboardingRepository(testDb.db, { now, userId: "user_other" });

    await local.save(onboarding);
    await other.save(undecidedOnboarding);
    await other.clear();

    await expect(local.load()).resolves.toEqual({
      ...onboarding,
      muscleFocus: { mode: "selected", muscleGroups: ["chest", "legs"] },
    });
    await expect(other.load()).resolves.toBeNull();
  });

  it("returns null and logs the raw payload when a stored row is corrupted", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    insertRawProfile({ fitnessGoal: "flying" });

    await expect(repository.load()).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("[db]"),
      expect.objectContaining({ raw: expect.objectContaining({ fitnessGoal: "flying" }) }),
    );
  });

  it("returns null for an unknown experience level", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    insertRawProfile({ experienceLevel: "pro" });

    await expect(repository.load()).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it("returns null when 'selected' mode has no muscle group rows", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    await repository.save(onboarding);
    testDb.sqlite.prepare("DELETE FROM user_focus_muscle_groups").run();

    await expect(repository.load()).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it("returns null when 'undecided' mode still has muscle group rows", async () => {
    const repository = createOnboardingRepository(testDb.db, { now });
    insertRawProfile({ mode: "undecided" });
    testDb.sqlite
      .prepare("INSERT INTO user_focus_muscle_groups (user_id, muscle_group) VALUES (?, ?)")
      .run(LOCAL_USER_ID, "chest");

    await expect(repository.load()).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});
