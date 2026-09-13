import React from "react";
import { ScrollView } from "react-native";
import { useOnboarding } from "@/hooks/use-onboarding";
import {
  OnboardingOptionCard,
  OnboardingStepFooter,
  OnboardingStepHeader,
  OnboardingStepLayout,
} from "@/components/onboarding";
import {
  EXPERIENCE_LEVEL_LABELS,
  ExperienceLevelSchema,
} from "@/schemas/onboarding.schema";

const STEP_INDEX = 1;

export default function StepExperience() {
  const { name, experienceLevel, setExperienceLevel, isStepValid, nextStep, prevStep, totalSteps } =
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
        title="Jak długo trenujesz?"
        subtitle={`${name}, dzięki temu dobierzemy odpowiedni poziom treningów`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16, gap: 12 }}
      >
        {ExperienceLevelSchema.options.map((level) => {
          const { label, emoji, description } = EXPERIENCE_LEVEL_LABELS[level];
          return (
            <OnboardingOptionCard
              key={level}
              testID={`onboarding-option-${level}`}
              label={label}
              emoji={emoji}
              description={description}
              isSelected={experienceLevel === level}
              onPress={() => setExperienceLevel(level)}
              selectionType="radio"
            />
          );
        })}
      </ScrollView>
    </OnboardingStepLayout>
  );
}
