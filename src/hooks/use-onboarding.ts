import { useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { OnboardingFormSchema } from "@/schemas/onboarding.schema";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { useOnboardingFormStore } from "@/stores/onboarding-form.store";

/** Step order — index is the `currentStep` passed by each route screen. */
const ONBOARDING_STEP_ROUTES = [
  "/(onboarding)/step-name",
  "/(onboarding)/step-experience",
  "/(onboarding)/step-goal",
  "/(onboarding)/step-muscle-groups",
  "/(onboarding)/step-summary",
] as const;

const TOTAL_STEPS = ONBOARDING_STEP_ROUTES.length;

/**
 * Hook for onboarding flow logic. Uses shared Zustand store
 * so form state persists across separate route screens.
 *
 * @param currentStep - The current step index (0-4), determined by route.
 */
export function useOnboarding(currentStep: number = 0) {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const name = useOnboardingFormStore((s) => s.name);
  const experienceLevel = useOnboardingFormStore((s) => s.experienceLevel);
  const fitnessGoal = useOnboardingFormStore((s) => s.fitnessGoal);
  const muscleFocus = useOnboardingFormStore((s) => s.muscleFocus);
  const setName = useOnboardingFormStore((s) => s.setName);
  const setExperienceLevel = useOnboardingFormStore((s) => s.setExperienceLevel);
  const setGoal = useOnboardingFormStore((s) => s.setGoal);
  const toggleMuscleGroup = useOnboardingFormStore((s) => s.toggleMuscleGroup);
  const toggleUndecidedMuscleFocus = useOnboardingFormStore((s) => s.toggleUndecidedMuscleFocus);
  const resetForm = useOnboardingFormStore((s) => s.resetForm);

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return name.trim().length > 0;
      case 1:
        return experienceLevel !== null;
      case 2:
        return fitnessGoal !== null;
      case 3:
        return muscleFocus !== null;
      case 4:
        return true; // Summary step is always valid
      default:
        return false;
    }
  }, [currentStep, name, experienceLevel, fitnessGoal, muscleFocus]);

  const nextStep = useCallback(() => {
    if (!isStepValid) return;

    const nextRoute = ONBOARDING_STEP_ROUTES[currentStep + 1];
    if (nextRoute) {
      router.push(nextRoute);
    }
  }, [currentStep, isStepValid, router]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      router.back();
    }
  }, [currentStep, router]);

  const submitOnboarding = useCallback(() => {
    const result = OnboardingFormSchema.safeParse({
      name: name.trim(),
      experienceLevel,
      fitnessGoal,
      muscleFocus,
    });

    if (result.success) {
      // RootLayout's onboarding guard redirects to home once the store flips
      completeOnboarding(result.data);
      resetForm();
    } else {
      console.warn("Onboarding validation failed:", result.error);
    }
  }, [name, experienceLevel, fitnessGoal, muscleFocus, completeOnboarding, resetForm]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    name,
    experienceLevel,
    fitnessGoal,
    muscleFocus,
    isStepValid,
    setName,
    setExperienceLevel,
    setGoal,
    toggleMuscleGroup,
    toggleUndecidedMuscleFocus,
    nextStep,
    prevStep,
    submitOnboarding,
  };
}
