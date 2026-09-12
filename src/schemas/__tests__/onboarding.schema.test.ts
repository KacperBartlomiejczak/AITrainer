import {
  OnboardingFormSchema,
  FitnessGoalSchema,
  MuscleGroupSchema,
  type OnboardingFormData,
} from "../onboarding.schema";

describe("OnboardingFormSchema", () => {
  const validData: OnboardingFormData = {
    name: "Kacper",
    fitnessGoal: "muscle_gain",
    focusMuscleGroups: ["chest", "back"],
  };

  it("accepts valid onboarding data", () => {
    const result = OnboardingFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Kacper");
      expect(result.data.fitnessGoal).toBe("muscle_gain");
      expect(result.data.focusMuscleGroups).toEqual(["chest", "back"]);
    }
  });

  it("rejects empty name", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      name: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fitnessGoal", () => {
    const { fitnessGoal: _, ...noGoal } = validData;
    const result = OnboardingFormSchema.safeParse(noGoal);
    expect(result.success).toBe(false);
  });

  it("rejects invalid fitnessGoal enum value", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      fitnessGoal: "invalid_goal",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty focusMuscleGroups array", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      focusMuscleGroups: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid muscle group in array", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      focusMuscleGroups: ["chest", "invalid_muscle"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts single muscle group", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      focusMuscleGroups: ["legs"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts all muscle groups", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      focusMuscleGroups: ["chest", "back", "legs", "shoulders", "arms", "abs"],
    });
    expect(result.success).toBe(true);
  });
});

describe("FitnessGoalSchema", () => {
  it.each(["weight_loss", "muscle_gain", "strength", "general_fitness", "maintenance"] as const)(
    "accepts valid goal: %s",
    (goal) => {
      const result = FitnessGoalSchema.safeParse(goal);
      expect(result.success).toBe(true);
    }
  );

  it("rejects invalid goal", () => {
    const result = FitnessGoalSchema.safeParse("bulk");
    expect(result.success).toBe(false);
  });
});

describe("MuscleGroupSchema", () => {
  it.each(["chest", "back", "legs", "shoulders", "arms", "abs"] as const)(
    "accepts valid muscle group: %s",
    (group) => {
      const result = MuscleGroupSchema.safeParse(group);
      expect(result.success).toBe(true);
    }
  );

  it("rejects invalid muscle group", () => {
    const result = MuscleGroupSchema.safeParse("biceps");
    expect(result.success).toBe(false);
  });
});
