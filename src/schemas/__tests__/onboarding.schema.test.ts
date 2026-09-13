import {
  OnboardingFormSchema,
  FitnessGoalSchema,
  MuscleGroupSchema,
  ExperienceLevelSchema,
  MuscleFocusSchema,
  EXPERIENCE_LEVEL_LABELS,
  UNDECIDED_MUSCLE_FOCUS_LABEL,
  type OnboardingFormData,
} from "../onboarding.schema";

describe("OnboardingFormSchema", () => {
  const validData: OnboardingFormData = {
    name: "Kacper",
    experienceLevel: "intermediate",
    fitnessGoal: "muscle_gain",
    muscleFocus: { mode: "selected", muscleGroups: ["chest", "back"] },
  };

  it("accepts valid onboarding data", () => {
    const result = OnboardingFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Kacper");
      expect(result.data.fitnessGoal).toBe("muscle_gain");
      expect(result.data.experienceLevel).toBe("intermediate");
      expect(result.data.muscleFocus).toEqual({ mode: "selected", muscleGroups: ["chest", "back"] });
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

  it("rejects empty selected muscle groups", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      muscleFocus: { mode: "selected", muscleGroups: [] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid muscle group in array", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      muscleFocus: { mode: "selected", muscleGroups: ["chest", "invalid_muscle"] },
    });
    expect(result.success).toBe(false);
  });

  it("accepts single muscle group", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      muscleFocus: { mode: "selected", muscleGroups: ["legs"] },
    });
    expect(result.success).toBe(true);
  });

  it("accepts all muscle groups", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      muscleFocus: {
        mode: "selected",
        muscleGroups: ["chest", "back", "legs", "shoulders", "arms", "abs"],
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts 'not sure yet' as the muscle focus", () => {
    const result = OnboardingFormSchema.safeParse({
      ...validData,
      muscleFocus: { mode: "undecided" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing experienceLevel", () => {
    const { experienceLevel: _, ...noExperience } = validData;
    expect(OnboardingFormSchema.safeParse(noExperience).success).toBe(false);
  });

  it("rejects missing muscleFocus", () => {
    const { muscleFocus: _, ...noFocus } = validData;
    expect(OnboardingFormSchema.safeParse(noFocus).success).toBe(false);
  });
});

describe("MuscleFocusSchema", () => {
  it("rejects 'not sure yet' mixed with muscle groups", () => {
    const result = MuscleFocusSchema.safeParse({ mode: "undecided", muscleGroups: ["chest"] });
    expect(result.success).toBe(false);
  });

  it("rejects 'selected' without muscle groups", () => {
    expect(MuscleFocusSchema.safeParse({ mode: "selected" }).success).toBe(false);
  });

  it("rejects unknown modes and shows a Polish message", () => {
    const result = MuscleFocusSchema.safeParse({ mode: "maybe" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Jeszcze nie wiem");
    }
  });
});

describe("ExperienceLevelSchema", () => {
  it.each(["beginner", "intermediate", "advanced"] as const)("accepts %s", (level) => {
    expect(ExperienceLevelSchema.safeParse(level).success).toBe(true);
  });

  it("rejects unknown level", () => {
    expect(ExperienceLevelSchema.safeParse("pro").success).toBe(false);
  });

  it("has a Polish label and description for every level", () => {
    for (const level of ExperienceLevelSchema.options) {
      expect(EXPERIENCE_LEVEL_LABELS[level].label.length).toBeGreaterThan(0);
      expect(EXPERIENCE_LEVEL_LABELS[level].description.length).toBeGreaterThan(0);
    }
    expect(EXPERIENCE_LEVEL_LABELS.intermediate.description).toContain("5–12");
  });
});

describe("UNDECIDED_MUSCLE_FOCUS_LABEL", () => {
  it("uses the 'Jeszcze nie wiem' wording", () => {
    expect(UNDECIDED_MUSCLE_FOCUS_LABEL.label).toBe("Jeszcze nie wiem");
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
