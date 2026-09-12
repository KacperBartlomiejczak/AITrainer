import { renderHook, act } from "@testing-library/react-native";
import { usePublicProfile } from "../use-public-profile";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { useRouter } from "expo-router";

describe("usePublicProfile", () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      onboardingData: {
        name: "Michał",
        fitnessGoal: "muscle_gain",
        focusMuscleGroups: ["chest", "arms"],
      },
      hasCompletedOnboarding: true,
      isHydrated: true,
    });
  });

  it("reads display name and goal from onboarding store", async () => {
    const { result, unmount } = await renderHook(() => usePublicProfile());

    expect(result.current.displayName).toBe("Michał");
    expect(result.current.fitnessGoalLabel).toBe("Masa mięśniowa");
    expect(result.current.streakDays).toBeGreaterThan(0);

    unmount();
  });

  it("falls back to default name when onboarding data is not set", async () => {
    useOnboardingStore.setState({
      onboardingData: null,
    });

    const { result, unmount } = await renderHook(() => usePublicProfile());
    expect(result.current.displayName).toBe("Kacper");

    unmount();
  });

  it("navigates to settings / profile edit when openSettings is called", async () => {
    const router = useRouter();
    const { result, unmount } = await renderHook(() => usePublicProfile());

    await act(async () => {
      result.current.openSettings();
    });

    expect(router.push).toHaveBeenCalledWith("/profile");

    unmount();
  });
});
