import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useHomeScreen } from "../use-home-screen";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { resetInMemoryDatabase, saveLocalProfile } from "@/db/testing/in-memory-client";
import { attachPhotoToWorkout, saveWorkoutSession } from "@/db/workout-history";
import { getFakeFileSystem } from "@/lib/testing/fake-file-system";
import { FriendWorkoutFeedSchema } from "@/schemas/friends-feed.schema";

jest.mock("@/db/client", () => jest.requireActual("@/db/testing/in-memory-client"));

async function saveFinishedWorkout(title: string, finishedMinutesAgo = 0) {
  const completedAt = new Date(Date.now() - finishedMinutesAgo * 60 * 1000);
  return saveWorkoutSession({
    routineId: "rtn_fbw_b",
    title,
    startedAt: new Date(completedAt.getTime() - 50 * 60 * 1000),
    completedAt,
    exercises: [
      { name: "Martwy ciąg rumuński", targetMuscle: "Nogi", sets: 3, targetReps: "8-10", completed: true },
      { name: "Wykroki", targetMuscle: "Nogi", sets: 3, targetReps: "10", completed: false },
    ],
  });
}

describe("useHomeScreen hook", () => {
  beforeEach(async () => {
    await saveLocalProfile();
  });

  afterEach(() => {
    resetInMemoryDatabase();
  });

  it("shows no recent activity for a user without workouts", async () => {
    const { result, unmount } = await renderHook(() => useHomeScreen());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.recentActivity).toBeNull();
    unmount();
  });

  it("shows the latest workout from the database as recent activity", async () => {
    await saveFinishedWorkout("Starszy trening", 2);
    const latest = await saveFinishedWorkout("FBW B — Całe ciało");
    getFakeFileSystem().addFile("file:///cache/picked.jpg");
    await attachPhotoToWorkout(latest.id, "file:///cache/picked.jpg");

    const { result, unmount } = await renderHook(() => useHomeScreen());

    await waitFor(() => expect(result.current.data.recentActivity).not.toBeNull());
    expect(result.current.data.recentActivity).toMatchObject({
      id: latest.id,
      title: "FBW B — Całe ciało",
      durationMinutes: 50,
      completedExerciseCount: 1,
      totalExerciseCount: 2,
    });
    expect(result.current.data.recentActivity?.completedAt).toMatch(/^Dziś, \d{2}:\d{2}$/);
    expect(result.current.data.recentActivity?.photoUri).toContain("workout-photos/");
    unmount();
  });

  it("provides a validated mock feed of friends' workouts", async () => {
    const { result, unmount } = await renderHook(() => useHomeScreen());

    expect(result.current.data.friendsFeed.length).toBeGreaterThanOrEqual(3);
    expect(FriendWorkoutFeedSchema.safeParse(result.current.data.friendsFeed).success).toBe(true);
    unmount();
  });

  it("picks up a workout saved elsewhere after refreshing", async () => {
    const { result, unmount } = await renderHook(() => useHomeScreen());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await saveFinishedWorkout("Nowy trening");
    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.data.recentActivity?.title).toBe("Nowy trening");
    unmount();
  });

  it("should initialize with validated home screen data", async () => {
    const { result } = await renderHook(() => useHomeScreen());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeDefined();
    expect(result.current.data.user.name).toBe("Kacper");
    expect(result.current.data.weeklyProgress.completedCount).toBe(3);
    expect(result.current.data.todayWorkout).not.toBeNull();
    expect(result.current.data.todayWorkout?.title).toContain("Klatka");
  });

  it("should allow refreshing data cleanly", async () => {
    const { result } = await renderHook(() => useHomeScreen());

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeDefined();
  });

  it("should use user name from onboarding store if available", async () => {
    useOnboardingStore.setState({
      hasCompletedOnboarding: true,
      onboardingData: {
        name: "Michał",
        experienceLevel: "beginner",
        fitnessGoal: "muscle_gain",
        muscleFocus: { mode: "selected", muscleGroups: ["chest"] },
      },
      isHydrated: true,
    });

    const { result, unmount } = await renderHook(() => useHomeScreen());
    expect(result.current.data.user.name).toBe("Michał");

    unmount();
    useOnboardingStore.getState().resetOnboarding();
  });

  it("should fall back gracefully to default user name when onboarding data in store is invalid or corrupt", async () => {
    // Malformed data simulating corrupted AsyncStorage payload (non-string name, invalid goal)
    useOnboardingStore.setState({
      hasCompletedOnboarding: true,
      onboardingData: {
        name: 12345 as unknown as string,
        experienceLevel: "beginner",
        fitnessGoal: "corrupted_goal" as unknown as "strength",
        muscleFocus: { mode: "undecided" },
      },
      isHydrated: true,
    });

    const { result, unmount } = await renderHook(() => useHomeScreen());
    expect(result.current.data.user.name).toBe("Kacper");

    unmount();
    useOnboardingStore.getState().resetOnboarding();
  });
});
