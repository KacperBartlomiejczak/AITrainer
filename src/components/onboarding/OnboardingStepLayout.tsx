import React, { type ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingProgress } from "./OnboardingProgress";

interface OnboardingStepLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared frame of every onboarding step: safe area, progress bar, content, footer. */
export function OnboardingStepLayout({
  currentStep,
  totalSteps,
  children,
  footer,
}: OnboardingStepLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: Math.max(insets.top, 16) }}>
      <View className="flex-1 px-6">
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        {children}
        <View className="pb-4" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          {footer}
        </View>
      </View>
    </View>
  );
}
