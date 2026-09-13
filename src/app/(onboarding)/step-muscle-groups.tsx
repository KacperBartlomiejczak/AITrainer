import React from "react";
import { ScrollView, View } from "react-native";
import { useOnboarding } from "@/hooks/use-onboarding";
import {
  MuscleGroupTile,
  OnboardingOptionCard,
  OnboardingStepFooter,
  OnboardingStepHeader,
  OnboardingStepLayout,
} from "@/components/onboarding";
import { getSelectedMuscleGroups, isUndecidedMuscleFocus } from "@/lib/muscle-focus";
import {
  MuscleGroupSchema,
  UNDECIDED_MUSCLE_FOCUS_LABEL,
} from "@/schemas/onboarding.schema";

const STEP_INDEX = 3;

export default function StepMuscleGroups() {
  const {
    muscleFocus,
    toggleMuscleGroup,
    toggleUndecidedMuscleFocus,
    isStepValid,
    nextStep,
    prevStep,
    totalSteps,
  } = useOnboarding(STEP_INDEX);

  const selectedGroups = getSelectedMuscleGroups(muscleFocus);

  return (
    <OnboardingStepLayout
      currentStep={STEP_INDEX}
      totalSteps={totalSteps}
      footer={
        <OnboardingStepFooter onBack={prevStep} onNext={nextStep} isNextDisabled={!isStepValid} />
      }
    >
      <OnboardingStepHeader
        title="Na czym się skupiamy?"
        subtitle="Wybierz partie ciała, na których chcesz się skupić"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="flex-row flex-wrap justify-between">
          {MuscleGroupSchema.options.map((group) => (
            <MuscleGroupTile
              key={group}
              group={group}
              isSelected={selectedGroups.includes(group)}
              onPress={toggleMuscleGroup}
            />
          ))}
        </View>

        {/* Exclusive option: picking it clears muscle groups, picking a group clears it */}
        <OnboardingOptionCard
          testID="muscle-focus-undecided"
          label={UNDECIDED_MUSCLE_FOCUS_LABEL.label}
          emoji={UNDECIDED_MUSCLE_FOCUS_LABEL.emoji}
          description={UNDECIDED_MUSCLE_FOCUS_LABEL.description}
          isSelected={isUndecidedMuscleFocus(muscleFocus)}
          onPress={toggleUndecidedMuscleFocus}
          selectionType="checkbox"
        />
      </ScrollView>
    </OnboardingStepLayout>
  );
}
