import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useOnboarding } from "@/hooks/use-onboarding";
import {
  OnboardingStepFooter,
  OnboardingStepLayout,
  OnboardingSummaryCard,
  OnboardingSummaryChip,
  OnboardingSummaryRow,
} from "@/components/onboarding";
import { H1, TextLead } from "@/components/ui/typography";
import { getSelectedMuscleGroups, isUndecidedMuscleFocus } from "@/lib/muscle-focus";
import {
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  MUSCLE_GROUP_LABELS,
  UNDECIDED_MUSCLE_FOCUS_LABEL,
} from "@/schemas/onboarding.schema";

const STEP_INDEX = 4;

export default function StepSummary() {
  const { name, experienceLevel, fitnessGoal, muscleFocus, submitOnboarding, prevStep, totalSteps } =
    useOnboarding(STEP_INDEX);

  const experienceInfo = experienceLevel ? EXPERIENCE_LEVEL_LABELS[experienceLevel] : null;
  const goalInfo = fitnessGoal ? FITNESS_GOAL_LABELS[fitnessGoal] : null;

  return (
    <OnboardingStepLayout
      currentStep={STEP_INDEX}
      totalSteps={totalSteps}
      footer={
        <OnboardingStepFooter onBack={prevStep} onNext={submitOnboarding} nextLabel="Zaczynamy! 🚀" />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 16 }}
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-[rgba(0,122,255,0.15)] items-center justify-center mb-6">
            <Text className="text-4xl">🎉</Text>
          </View>
          <H1 className="text-center mb-3">Świetnie, {name}!</H1>
          <TextLead className="text-center">Wszystko gotowe — sprawdź swoje dane</TextLead>
        </View>

        <View className="gap-3">
          {experienceInfo && (
            <OnboardingSummaryCard title="Twój staż">
              <OnboardingSummaryRow {...experienceInfo} />
            </OnboardingSummaryCard>
          )}

          {goalInfo && (
            <OnboardingSummaryCard title="Twój cel">
              <OnboardingSummaryRow {...goalInfo} />
            </OnboardingSummaryCard>
          )}

          <OnboardingSummaryCard title="Skupiamy się na">
            <View className="flex-row flex-wrap gap-2 mt-1">
              {isUndecidedMuscleFocus(muscleFocus) ? (
                <OnboardingSummaryChip {...UNDECIDED_MUSCLE_FOCUS_LABEL} />
              ) : (
                getSelectedMuscleGroups(muscleFocus).map((group) => (
                  <OnboardingSummaryChip key={group} {...MUSCLE_GROUP_LABELS[group]} />
                ))
              )}
            </View>
          </OnboardingSummaryCard>
        </View>
      </ScrollView>
    </OnboardingStepLayout>
  );
}
