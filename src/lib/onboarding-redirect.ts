import type {
  OnboardingGuardInput,
  OnboardingRedirectRoute,
} from "@/schemas/navigation.schema";

const ONBOARDING_GROUP_SEGMENT = "(onboarding)";
const ONBOARDING_STEP_PREFIX = "step-";
const SPLASH_SEGMENT = "splash";

/**
 * Decides where the root onboarding guard should send the user.
 * Returns `null` when the user is already where they belong, which keeps
 * the guard idempotent and prevents redirect loops.
 */
export function resolveOnboardingRedirect({
  isHydrated,
  isSplashActive,
  hasCompletedOnboarding,
  segments,
}: OnboardingGuardInput): OnboardingRedirectRoute | null {
  if (!isHydrated || isSplashActive) return null;

  const inOnboarding = segments.some(
    (segment) =>
      segment === ONBOARDING_GROUP_SEGMENT ||
      segment.startsWith(ONBOARDING_STEP_PREFIX),
  );
  const onSplash = segments.includes(SPLASH_SEGMENT);

  if (!hasCompletedOnboarding && !inOnboarding && !onSplash) {
    return "/(onboarding)/step-name";
  }
  if (hasCompletedOnboarding && (inOnboarding || onSplash)) {
    return "/";
  }
  return null;
}
