import {
  ProfileFormSchema,
  AppSettingsSchema,
  UserDataExportSchema,
  type ProfileFormData,
} from "../profile.schema";

describe("ProfileFormSchema", () => {
  const validData: ProfileFormData = {
    name: "Kacper",
    experienceLevel: "beginner",
    fitnessGoal: "muscle_gain",
    muscleFocus: { mode: "selected", muscleGroups: ["chest", "back"] },
  };

  it("accepts valid profile form data", () => {
    const result = ProfileFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Kacper");
      expect(result.data.fitnessGoal).toBe("muscle_gain");
      expect(result.data.muscleFocus).toEqual({ mode: "selected", muscleGroups: ["chest", "back"] });
    }
  });

  it("trims whitespace from name", () => {
    const result = ProfileFormSchema.safeParse({
      ...validData,
      name: "   Tomasz   ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Tomasz");
    }
  });

  it("rejects empty or whitespace-only name", () => {
    const resultEmpty = ProfileFormSchema.safeParse({
      ...validData,
      name: "",
    });
    expect(resultEmpty.success).toBe(false);

    const resultWhitespace = ProfileFormSchema.safeParse({
      ...validData,
      name: "   ",
    });
    expect(resultWhitespace.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = ProfileFormSchema.safeParse({
      ...validData,
      name: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty selected muscle groups", () => {
    const result = ProfileFormSchema.safeParse({
      ...validData,
      muscleFocus: { mode: "selected", muscleGroups: [] },
    });
    expect(result.success).toBe(false);
  });

  it("accepts 'not sure yet' muscle focus", () => {
    const result = ProfileFormSchema.safeParse({
      ...validData,
      muscleFocus: { mode: "undecided" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing experience level", () => {
    const { experienceLevel: _, ...rest } = validData;
    expect(ProfileFormSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid fitnessGoal", () => {
    const result = ProfileFormSchema.safeParse({
      ...validData,
      fitnessGoal: "unknown_goal",
    });
    expect(result.success).toBe(false);
  });
});

describe("AppSettingsSchema", () => {
  it("uses sensible defaults", () => {
    const result = AppSettingsSchema.parse({});
    expect(result.theme).toBe("dark");
    expect(result.soundEnabled).toBe(true);
    expect(result.hapticsEnabled).toBe(true);
    expect(result.units).toBe("metric");
  });

  it("accepts custom settings", () => {
    const result = AppSettingsSchema.safeParse({
      theme: "light",
      soundEnabled: false,
      hapticsEnabled: true,
      units: "imperial",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.theme).toBe("light");
      expect(result.data.units).toBe("imperial");
    }
  });
});

describe("UserDataExportSchema", () => {
  it("validates complete exported user data package", () => {
    const exportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      profile: {
        name: "Kacper",
        experienceLevel: "advanced",
        fitnessGoal: "strength",
        muscleFocus: { mode: "undecided" },
      },
      appSettings: {
        theme: "dark",
        soundEnabled: true,
        hapticsEnabled: true,
        units: "metric",
      },
    };

    const result = UserDataExportSchema.safeParse(exportData);
    expect(result.success).toBe(true);
  });
});
