import { renderHook, act } from "@testing-library/react-native";
import { useHomeScreen } from "../use-home-screen";
import { useOnboardingStore } from "@/stores/onboarding.store";

describe("useHomeScreen hook", () => {
  it("should initialize with validated home screen data", async () => {
    const { result } = await renderHook(() => useHomeScreen());

    expect(result.current.isLoading).toBe(false);
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
    expect(result.current.data).toBeDefined();
  });

  it("should use user name from onboarding store if available", async () => {
    useOnboardingStore.setState({
      hasCompletedOnboarding: true,
      onboardingData: {
        name: "Michał",
        fitnessGoal: "muscle_gain",
        focusMuscleGroups: ["chest"],
      },
      isHydrated: true,
    });

    const { result, unmount } = await renderHook(() => useHomeScreen());
    expect(result.current.data.user.name).toBe("Michał");

    unmount();
    useOnboardingStore.getState().resetOnboarding();
  });
});
