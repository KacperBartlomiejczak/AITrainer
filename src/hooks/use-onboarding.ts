import { useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { OnboardingFormSchema } from "@/schemas/onboarding.schema";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { useOnboardingFormStore } from "@/stores/onboarding-form.store";

const TOTAL_STEPS = 4;

/**
 * Hook for onboarding flow logic. Uses shared Zustand store
 * so form state persists across separate route screens.
 *
 * @param currentStep - The current step index (0-3), determined by route.
 */
export function useOnboarding(currentStep: number = 0) {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const name = useOnboardingFormStore((s) => s.name);
  const fitnessGoal = useOnboardingFormStore((s) => s.fitnessGoal);
  const focusMuscleGroups = useOnboardingFormStore((s) => s.focusMuscleGroups);
  const setName = useOnboardingFormStore((s) => s.setName);
  const setGoal = useOnboardingFormStore((s) => s.setGoal);
  const toggleMuscleGroup = useOnboardingFormStore((s) => s.toggleMuscleGroup);
  const resetForm = useOnboardingFormStore((s) => s.resetForm);

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return name.trim().length > 0;
      case 1:
        return fitnessGoal !== null;
      case 2:
        return focusMuscleGroups.length > 0;
      case 3:
        return true; // Summary step is always valid
      default:
        return false;
    }
  }, [currentStep, name, fitnessGoal, focusMuscleGroups]);

  const nextStep = useCallback(() => {
    if (!isStepValid) return;

    switch (currentStep) {
      case 0:
        router.push("/(onboarding)/step-goal");
        break;
      case 1:
        router.push("/(onboarding)/step-muscle-groups");
        break;
      case 2:
        router.push("/(onboarding)/step-summary");
        break;
      default:
        break;
    }
  }, [currentStep, isStepValid, router]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      router.back();
    }
  }, [currentStep, router]);

  const submitOnboarding = useCallback(() => {
    if (!fitnessGoal) return;

    const formData = {
      name: name.trim(),
      fitnessGoal,
      focusMuscleGroups,
    };

    const result = OnboardingFormSchema.safeParse(formData);

    if (result.success) {
      // RootLayout's onboarding guard redirects to home once the store flips
      completeOnboarding(result.data);
      resetForm();
    } else {
      console.warn("Onboarding validation failed:", result.error);
    }
  }, [name, fitnessGoal, focusMuscleGroups, completeOnboarding, resetForm]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    name,
    fitnessGoal,
    focusMuscleGroups,
    isStepValid,
    setName,
    setGoal,
    toggleMuscleGroup,
    nextStep,
    prevStep,
    submitOnboarding,
  };
}
