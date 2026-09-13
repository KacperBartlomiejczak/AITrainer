import { useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import {
  FITNESS_GOAL_LABELS,
  OnboardingFormSchema,
} from "@/schemas/onboarding.schema";

export function usePublicProfile() {
  const router = useRouter();
  const rawOnboardingData = useOnboardingStore((s) => s.onboardingData);

  const validatedData = useMemo(() => {
    if (!rawOnboardingData) return null;
    const parsed = OnboardingFormSchema.safeParse(rawOnboardingData);
    return parsed.success ? parsed.data : null;
  }, [rawOnboardingData]);

  const displayName = useMemo(() => {
    return validatedData?.name?.trim() || "Kacper";
  }, [validatedData]);

  const fitnessGoalLabel = useMemo(() => {
    if (!validatedData?.fitnessGoal) return "Budowa sylwetki";
    const item = FITNESS_GOAL_LABELS[validatedData.fitnessGoal];
    return item?.label ?? "Budowa sylwetki";
  }, [validatedData]);

  const streakDays = 4;

  const openSettings = useCallback(() => {
    router.push("/profile" as never);
  }, [router]);

  return {
    displayName,
    fitnessGoalLabel,
    streakDays,
    openSettings,
  };
}
