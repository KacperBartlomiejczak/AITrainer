import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingProgress } from "@/components/onboarding";
import { H1, TextLead } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  FITNESS_GOAL_LABELS,
  MUSCLE_GROUP_LABELS,
} from "@/schemas/onboarding.schema";

export default function StepSummary() {
  const insets = useSafeAreaInsets();
  const { name, fitnessGoal, focusMuscleGroups, submitOnboarding, prevStep, totalSteps } =
    useOnboarding(3);

  const goalInfo = fitnessGoal ? FITNESS_GOAL_LABELS[fitnessGoal] : null;

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-1 px-6">
        {/* Progress */}
        <OnboardingProgress currentStep={3} totalSteps={totalSteps} />

        {/* Content */}
        <View className="flex-1 justify-center">
          {/* Welcome */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-[rgba(0,122,255,0.15)] items-center justify-center mb-6">
              <Text className="text-4xl">🎉</Text>
            </View>
            <H1 className="text-center mb-3">
              Świetnie, {name}!
            </H1>
            <TextLead className="text-center">
              Wszystko gotowe — sprawdź swoje dane
            </TextLead>
          </View>

          {/* Summary Cards */}
          <View className="gap-3">
            {/* Goal Card */}
            {goalInfo && (
              <View className="bg-[#121214] rounded-2xl p-4 border border-[#27272A]">
                <Text className="text-xs text-[#71717A] font-semibold uppercase tracking-wider mb-2">
                  Twój cel
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">{goalInfo.emoji}</Text>
                  <View>
                    <Text className="text-white font-bold text-base">
                      {goalInfo.label}
                    </Text>
                    <Text className="text-[#A1A1AA] text-xs">
                      {goalInfo.description}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Muscle Groups Card */}
            <View className="bg-[#121214] rounded-2xl p-4 border border-[#27272A]">
              <Text className="text-xs text-[#71717A] font-semibold uppercase tracking-wider mb-3">
                Skupiamy się na
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {focusMuscleGroups.map((group) => {
                  const info = MUSCLE_GROUP_LABELS[group];
                  return (
                    <View
                      key={group}
                      className="bg-[rgba(0,122,255,0.15)] rounded-xl px-3 py-2 flex-row items-center"
                    >
                      <Text className="mr-1.5">{info.emoji}</Text>
                      <Text className="text-[#007AFF] text-sm font-semibold">
                        {info.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View
          className="flex-row gap-3 pb-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Button
            variant="secondary"
            size="lg"
            onPress={prevStep}
            className="flex-1"
          >
            Wstecz
          </Button>
          <Button
            size="lg"
            onPress={submitOnboarding}
            className="flex-[2]"
          >
            Zaczynamy! 🚀
          </Button>
        </View>
      </View>
    </View>
  );
}
