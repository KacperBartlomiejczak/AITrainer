import React from "react";
import { View } from "react-native";
import { H1, TextLead } from "@/components/ui/typography";

interface OnboardingStepHeaderProps {
  title: string;
  subtitle: string;
}

export function OnboardingStepHeader({ title, subtitle }: OnboardingStepHeaderProps) {
  return (
    <View className="items-center mt-6 mb-6">
      <H1 className="text-center mb-3">{title}</H1>
      <TextLead className="text-center">{subtitle}</TextLead>
    </View>
  );
}
