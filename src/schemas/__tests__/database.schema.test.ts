import {
  DatabaseBootstrapStatusSchema,
  LOCAL_USER_ID,
  UserFocusMuscleGroupRowListSchema,
  UserFocusMuscleGroupRowSchema,
  UserProfileRowSchema,
} from "../database.schema";

const now = new Date("2026-09-13T10:00:00.000Z");

const validProfileRow = {
  id: LOCAL_USER_ID,
  name: "Kacper",
  experienceLevel: "beginner",
  fitnessGoal: "strength",
  muscleFocusMode: "undecided",
  onboardingCompletedAt: now,
  createdAt: now,
  updatedAt: now,
};

describe("UserProfileRowSchema", () => {
  it("accepts a valid profile row", () => {
    expect(UserProfileRowSchema.safeParse(validProfileRow).success).toBe(true);
  });

  it("rejects an unknown fitness goal", () => {
    const result = UserProfileRowSchema.safeParse({ ...validProfileRow, fitnessGoal: "flying" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown experience level and muscle focus mode", () => {
    expect(UserProfileRowSchema.safeParse({ ...validProfileRow, experienceLevel: "pro" }).success).toBe(false);
    expect(UserProfileRowSchema.safeParse({ ...validProfileRow, muscleFocusMode: "maybe" }).success).toBe(false);
  });

  it("rejects an empty name and empty id", () => {
    expect(UserProfileRowSchema.safeParse({ ...validProfileRow, name: "" }).success).toBe(false);
    expect(UserProfileRowSchema.safeParse({ ...validProfileRow, id: "" }).success).toBe(false);
  });

  it("rejects non-date timestamps", () => {
    const result = UserProfileRowSchema.safeParse({ ...validProfileRow, createdAt: 1757757600000 });
    expect(result.success).toBe(false);
  });
});

describe("UserFocusMuscleGroupRowSchema", () => {
  it("accepts a valid row", () => {
    expect(
      UserFocusMuscleGroupRowSchema.safeParse({ userId: LOCAL_USER_ID, muscleGroup: "chest" }).success,
    ).toBe(true);
  });

  it("rejects an unknown muscle group inside a list", () => {
    const result = UserFocusMuscleGroupRowListSchema.safeParse([
      { userId: LOCAL_USER_ID, muscleGroup: "chest" },
      { userId: LOCAL_USER_ID, muscleGroup: "tail" },
    ]);
    expect(result.success).toBe(false);
  });
});

describe("DatabaseBootstrapStatusSchema", () => {
  it("accepts only known statuses", () => {
    expect(DatabaseBootstrapStatusSchema.options).toEqual(["loading", "ready", "error"]);
    expect(DatabaseBootstrapStatusSchema.safeParse("done").success).toBe(false);
  });
});
