import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingProgress } from "@/components/onboarding";
import { H1, TextLead } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  MUSCLE_GROUP_LABELS,
  type MuscleGroup,
} from "@/schemas/onboarding.schema";
import { cn } from "@/lib/utils";

const MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];

export default function StepMuscleGroups() {
  const insets = useSafeAreaInsets();
  const { focusMuscleGroups, toggleMuscleGroup, isStepValid, nextStep, prevStep, totalSteps } =
    useOnboarding(2);

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-1 px-6">
        {/* Progress */}
        <OnboardingProgress currentStep={2} totalSteps={totalSteps} />

        {/* Header */}
        <View className="items-center mt-6 mb-6">
          <H1 className="text-center mb-3">Na czym się skupiamy?</H1>
          <TextLead className="text-center">
            Wybierz partie ciała, na których chcesz się skupić
          </TextLead>
        </View>

        {/* Muscle Group Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <View className="flex-row flex-wrap justify-between">
            {MUSCLE_GROUPS.map((group) => {
              const { label, emoji } = MUSCLE_GROUP_LABELS[group];
              const isSelected = focusMuscleGroups.includes(group);

              return (
                <Pressable
                  key={group}
                  onPress={() => toggleMuscleGroup(group)}
                  className={cn(
                    "w-[48%] rounded-2xl p-4 mb-3 border items-center",
                    isSelected
                      ? "bg-[rgba(0,122,255,0.15)] border-[#007AFF]"
                      : "bg-[#121214] border-[#27272A]"
                  )}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <View
                    className={cn(
                      "w-14 h-14 rounded-2xl items-center justify-center mb-3",
                      isSelected ? "bg-[#007AFF]" : "bg-[#1E1E22]"
                    )}
                  >
                    <Text className="text-3xl">{emoji}</Text>
                  </View>
                  <Text
                    className={cn(
                      "text-sm font-bold text-center",
                      isSelected ? "text-[#007AFF]" : "text-white"
                    )}
                  >
                    {label}
                  </Text>
                  {isSelected && (
                    <View className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#007AFF] items-center justify-center">
                      <Text className="text-white text-[10px] font-bold">✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
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
