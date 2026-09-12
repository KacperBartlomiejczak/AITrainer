import { Redirect } from "expo-router";

/**
 * Default onboarding route — redirects to the first step.
 */
export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/step-name" />;
}
