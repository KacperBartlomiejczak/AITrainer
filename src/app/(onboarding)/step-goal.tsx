import React from "react";
import { ScrollView } from "react-native";
import { useOnboarding } from "@/hooks/use-onboarding";
import {
  OnboardingOptionCard,
  OnboardingStepFooter,
  OnboardingStepHeader,
  OnboardingStepLayout,
} from "@/components/onboarding";
import { FITNESS_GOAL_LABELS, FitnessGoalSchema } from "@/schemas/onboarding.schema";

const STEP_INDEX = 2;

export default function StepGoal() {
  const { name, fitnessGoal, setGoal, isStepValid, nextStep, prevStep, totalSteps } =
    useOnboarding(STEP_INDEX);

  return (
    <OnboardingStepLayout
      currentStep={STEP_INDEX}
      totalSteps={totalSteps}
      footer={
        <OnboardingStepFooter onBack={prevStep} onNext={nextStep} isNextDisabled={!isStepValid} />
      }
    >
      <OnboardingStepHeader
        title="Co chcesz osiągnąć?"
        subtitle={`${name}, powiedz nam jaki jest Twój główny cel treningowy`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16, gap: 12 }}
      >
        {FitnessGoalSchema.options.map((goal) => {
          const { label, emoji, description } = FITNESS_GOAL_LABELS[goal];
          return (
            <OnboardingOptionCard
              key={goal}
              testID={`onboarding-option-${goal}`}
              label={label}
              emoji={emoji}
              description={description}
              isSelected={fitnessGoal === goal}
              onPress={() => setGoal(goal)}
              selectionType="radio"
            />
          );
        })}
      </ScrollView>
    </OnboardingStepLayout>
  );
}
