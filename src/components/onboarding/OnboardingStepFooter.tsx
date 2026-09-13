import React from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";

interface OnboardingStepFooterProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
}

export function OnboardingStepFooter({
  onBack,
  onNext,
  nextLabel = "Dalej",
  isNextDisabled = false,
}: OnboardingStepFooterProps) {
  return (
    <View className="flex-row gap-3">
      <Button variant="secondary" size="lg" onPress={onBack} className="flex-1">
        Wstecz
      </Button>
      <Button size="lg" disabled={isNextDisabled} onPress={onNext} className="flex-[2]">
        {nextLabel}
      </Button>
    </View>
  );
}
