import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          className={cn(
            "h-1 rounded-full",
            i <= currentStep ? "bg-[#007AFF]" : "bg-[#27272A]",
            i === currentStep ? "w-8" : "w-4"
          )}
        />
      ))}
    </View>
  );
}
