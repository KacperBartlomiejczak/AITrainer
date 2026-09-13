import { useOnboardingStore } from "../onboarding.store";
import type { OnboardingFormData } from "@/schemas/onboarding.schema";

const onboarding: OnboardingFormData = {
  name: "Kacper",
  experienceLevel: "advanced",
  fitnessGoal: "maintenance",
  muscleFocus: { mode: "selected", muscleGroups: ["shoulders"] },
};

const initialState = useOnboardingStore.getState();

describe("useOnboardingStore", () => {
  afterEach(() => {
    useOnboardingStore.setState(initialState, true);
  });

  it("starts un-hydrated until the database has been read", () => {
    expect(initialState.isHydrated).toBe(false);
    expect(initialState.hasCompletedOnboarding).toBe(false);
    expect(initialState.onboardingData).toBeNull();
  });

  it("hydrate(data) restores a completed onboarding", () => {
    useOnboardingStore.getState().hydrate(onboarding);

    expect(useOnboardingStore.getState()).toMatchObject({
      isHydrated: true,
      hasCompletedOnboarding: true,
      onboardingData: onboarding,
    });
  });

  it("hydrate(null) marks the store ready for a first-time user", () => {
    useOnboardingStore.getState().hydrate(null);

    expect(useOnboardingStore.getState()).toMatchObject({
      isHydrated: true,
      hasCompletedOnboarding: false,
      onboardingData: null,
    });
  });
});
