import type { OnboardingGuardInput } from "@/schemas/navigation.schema";
import { resolveOnboardingRedirect } from "../onboarding-redirect";

const baseInput: OnboardingGuardInput = {
  isHydrated: true,
  isSplashActive: false,
  hasCompletedOnboarding: false,
  segments: [],
};

describe("resolveOnboardingRedirect", () => {
  it("returns null while the store is not hydrated", () => {
    expect(resolveOnboardingRedirect({ ...baseInput, isHydrated: false })).toBeNull();
  });

  it("returns null while the splash overlay is active", () => {
    expect(resolveOnboardingRedirect({ ...baseInput, isSplashActive: true })).toBeNull();
  });

  it("sends a new user outside onboarding to the first step", () => {
    expect(resolveOnboardingRedirect(baseInput)).toBe("/(onboarding)/step-name");
  });

  it("keeps a new user who is already inside onboarding in place", () => {
    expect(
      resolveOnboardingRedirect({ ...baseInput, segments: ["(onboarding)", "step-goal"] }),
    ).toBeNull();
  });

  it("leaves a new user on the standalone splash route alone", () => {
    expect(resolveOnboardingRedirect({ ...baseInput, segments: ["splash"] })).toBeNull();
  });

  it("sends an onboarded user out of onboarding to home", () => {
    expect(
      resolveOnboardingRedirect({
        ...baseInput,
        hasCompletedOnboarding: true,
        segments: ["(onboarding)", "step-summary"],
      }),
    ).toBe("/");
  });

  it("sends an onboarded user from the splash route to home", () => {
    expect(
      resolveOnboardingRedirect({
        ...baseInput,
        hasCompletedOnboarding: true,
        segments: ["splash"],
      }),
    ).toBe("/");
  });

  it("is idempotent: an onboarded user already at home is not redirected again", () => {
    expect(
      resolveOnboardingRedirect({ ...baseInput, hasCompletedOnboarding: true, segments: [] }),
    ).toBeNull();
  });

  it("does not redirect an onboarded user on other app screens", () => {
    expect(
      resolveOnboardingRedirect({
        ...baseInput,
        hasCompletedOnboarding: true,
        segments: ["workout", "[id]"],
      }),
    ).toBeNull();
  });
});
