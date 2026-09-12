import { useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { FITNESS_GOAL_LABELS } from "@/schemas/onboarding.schema";

export function usePublicProfile() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((s) => s.onboardingData);

  const displayName = useMemo(() => {
    return onboardingData?.name?.trim() || "Kacper";
  }, [onboardingData]);

  const fitnessGoalLabel = useMemo(() => {
    if (!onboardingData?.fitnessGoal) return "Budowa sylwetki";
    const item = FITNESS_GOAL_LABELS[onboardingData.fitnessGoal];
    return item?.label ?? "Budowa sylwetki";
  }, [onboardingData]);

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
