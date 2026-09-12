import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingProgress } from "@/components/onboarding";
import { H1, TextLead } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  FITNESS_GOAL_LABELS,
  type FitnessGoal,
} from "@/schemas/onboarding.schema";
import { cn } from "@/lib/utils";

const GOALS = Object.keys(FITNESS_GOAL_LABELS) as FitnessGoal[];

export default function StepGoal() {
  const insets = useSafeAreaInsets();
  const { name, fitnessGoal, setGoal, isStepValid, nextStep, prevStep, totalSteps } =
    useOnboarding(1);

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-1 px-6">
        {/* Progress */}
        <OnboardingProgress currentStep={1} totalSteps={totalSteps} />

        {/* Header */}
        <View className="items-center mt-6 mb-6">
          <H1 className="text-center mb-3">Co chcesz osiągnąć?</H1>
          <TextLead className="text-center">
            {name}, powiedz nam jaki jest Twój główny cel treningowy
          </TextLead>
        </View>

        {/* Goal Cards */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16, gap: 12 }}
        >
          {GOALS.map((goal) => {
            const { label, emoji, description } = FITNESS_GOAL_LABELS[goal];
            const isSelected = fitnessGoal === goal;

            return (
              <Pressable
                key={goal}
                onPress={() => setGoal(goal)}
                className={cn(
                  "flex-row items-center rounded-2xl p-4 border",
                  isSelected
                    ? "bg-[rgba(0,122,255,0.15)] border-[#007AFF]"
                    : "bg-[#121214] border-[#27272A]"
                )}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  className={cn(
                    "w-12 h-12 rounded-xl items-center justify-center mr-4",
                    isSelected ? "bg-[#007AFF]" : "bg-[#1E1E22]"
                  )}
                >
                  <Text className="text-2xl">{emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={cn(
                      "text-base font-bold mb-0.5",
                      isSelected ? "text-[#007AFF]" : "text-white"
                    )}
                  >
                    {label}
                  </Text>
                  <Text className="text-xs text-[#A1A1AA]">{description}</Text>
                </View>
                {isSelected && (
                  <View className="w-6 h-6 rounded-full bg-[#007AFF] items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

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
            disabled={!isStepValid}
            onPress={nextStep}
            className="flex-[2]"
          >
            Dalej
          </Button>
        </View>
      </View>
    </View>
  );
}
