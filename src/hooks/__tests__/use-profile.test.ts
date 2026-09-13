import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useProfile } from "../use-profile";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { UserDataExportSchema } from "@/schemas/profile.schema";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { saveFinishedWorkout } from "@/db/testing/workout-fixtures";
import { loadWorkoutHistory } from "@/db/workout-history";
import { getFakeFileSystem } from "@/lib/testing/fake-file-system";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

describe("useProfile", () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      hasCompletedOnboarding: true,
      onboardingData: {
        name: "Kacper",
        experienceLevel: "intermediate",
        fitnessGoal: "muscle_gain",
        muscleFocus: { mode: "selected", muscleGroups: ["chest", "back"] },
      },
      isHydrated: true,
    });
  });

  afterEach(() => {
    resetInMemoryDatabase();
    useOnboardingStore.setState({
      hasCompletedOnboarding: false,
      onboardingData: null,
      isHydrated: true,
    });
  });

  it("initializes with data from onboarding store", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    expect(result.current.name).toBe("Kacper");
    expect(result.current.fitnessGoal).toBe("muscle_gain");
    expect(result.current.experienceLevel).toBe("intermediate");
    expect(result.current.muscleFocus).toEqual({ mode: "selected", muscleGroups: ["chest", "back"] });
    expect(result.current.isDirty).toBe(false);

    unmount();
  });

  it("updates name and tracks dirty state", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.setName("Tomasz");
    });

    expect(result.current.name).toBe("Tomasz");
    expect(result.current.isDirty).toBe(true);

    unmount();
  });

  it("updates fitness goal and tracks dirty state", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.setFitnessGoal("strength");
    });

    expect(result.current.fitnessGoal).toBe("strength");
    expect(result.current.isDirty).toBe(true);

    unmount();
  });

  it("toggles muscle groups correctly", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    // Add legs
    await act(async () => {
      result.current.toggleMuscleGroup("legs");
    });
    expect(result.current.muscleFocus).toEqual({
      mode: "selected",
      muscleGroups: ["chest", "back", "legs"],
    });

    // Remove chest
    await act(async () => {
      result.current.toggleMuscleGroup("chest");
    });
    expect(result.current.muscleFocus).toEqual({ mode: "selected", muscleGroups: ["back", "legs"] });

    unmount();
  });

  it("'Jeszcze nie wiem' replaces muscle groups and can be saved", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.toggleUndecidedMuscleFocus();
    });
    expect(result.current.muscleFocus).toEqual({ mode: "undecided" });
    expect(result.current.isDirty).toBe(true);

    let saved = false;
    await act(async () => {
      saved = result.current.saveProfile();
    });

    expect(saved).toBe(true);
    expect(useOnboardingStore.getState().onboardingData?.muscleFocus).toEqual({ mode: "undecided" });

    await act(async () => {
      result.current.toggleMuscleGroup("abs");
    });
    expect(result.current.muscleFocus).toEqual({ mode: "selected", muscleGroups: ["abs"] });

    unmount();
  });

  it("updates experience level and saves it", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.setExperienceLevel("advanced");
    });
    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      result.current.saveProfile();
    });
    expect(useOnboardingStore.getState().onboardingData?.experienceLevel).toBe("advanced");

    unmount();
  });

  it("fails validation and refuses to save if name is empty", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.setName("   ");
    });

    let saved = false;
    await act(async () => {
      saved = result.current.saveProfile();
    });

    expect(saved).toBe(false);
    expect(result.current.errors.name).toBeDefined();
    // Store should NOT be updated
    expect(useOnboardingStore.getState().onboardingData?.name).toBe("Kacper");

    unmount();
  });

  it("fails validation and refuses to save if no muscle groups are selected", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.toggleMuscleGroup("chest");
      result.current.toggleMuscleGroup("back");
    });

    let saved = false;
    await act(async () => {
      saved = result.current.saveProfile();
    });

    expect(saved).toBe(false);
    expect(result.current.errors.muscleFocus).toBeDefined();

    unmount();
  });

  it("saves valid profile changes to store and resets dirty flag", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.setName("Kacper B.");
      result.current.setFitnessGoal("general_fitness");
    });

    let saved = false;
    await act(async () => {
      saved = result.current.saveProfile();
    });

    expect(saved).toBe(true);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isDirty).toBe(false);

    // Verify store was updated
    const stored = useOnboardingStore.getState().onboardingData;
    expect(stored?.name).toBe("Kacper B.");
    expect(stored?.fitnessGoal).toBe("general_fitness");

    unmount();
  });

  it("resets form back to stored values", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.setName("TempName");
      result.current.setFitnessGoal("weight_loss");
    });

    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      result.current.resetForm();
    });

    expect(result.current.name).toBe("Kacper");
    expect(result.current.fitnessGoal).toBe("muscle_gain");
    expect(result.current.isDirty).toBe(false);

    unmount();
  });

  it("exports user data adhering to UserDataExportSchema", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    const jsonString = await result.current.exportData();
    expect(typeof jsonString).toBe("string");

    const parsed = JSON.parse(jsonString);
    const validation = UserDataExportSchema.safeParse(parsed);
    expect(validation.success).toBe(true);

    unmount();
  });

  it("includes the workout history in the export, without photo file paths", async () => {
    await saveLocalProfile();
    const { id } = await saveFinishedWorkout({ withPhoto: true });
    const { result, unmount } = await renderHook(() => useProfile());

    const parsed = UserDataExportSchema.parse(JSON.parse(await result.current.exportData()));

    expect(parsed.workoutSessions.map((session) => [session.id, session.hasPhoto])).toEqual([[id, true]]);
    unmount();
  });

  it("deletes workout history and photos together with the profile", async () => {
    await saveLocalProfile();
    await saveFinishedWorkout({ withPhoto: true });
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.resetAllData();
    });

    await waitFor(async () => expect(await loadWorkoutHistory()).toEqual([]));
    expect(getFakeFileSystem().listFiles().some((uri) => uri.includes("workout-photos/"))).toBe(false);
    unmount();
  });

  it("resets all user data via resetAllData", async () => {
    const { result, unmount } = await renderHook(() => useProfile());

    await act(async () => {
      result.current.resetAllData();
    });

    expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(false);
    expect(useOnboardingStore.getState().onboardingData).toBeNull();

    unmount();
  });
});
