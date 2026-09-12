import React from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingProgress } from "@/components/onboarding";
import { H1, TextLead } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function StepName() {
  const insets = useSafeAreaInsets();
  const { name, setName, isStepValid, nextStep, totalSteps } = useOnboarding(0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-1 px-6">
        {/* Progress */}
        <OnboardingProgress currentStep={0} totalSteps={totalSteps} />

        {/* Content */}
        <View className="flex-1 justify-center">
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-[#1E1E22] items-center justify-center mb-6">
              <H1 className="text-4xl">👋</H1>
            </View>
            <H1 className="text-center mb-3">Jak masz na imię?</H1>
            <TextLead className="text-center">
              Chcemy Cię poznać, aby dopasować trening do Twoich potrzeb
            </TextLead>
          </View>

          {/* Input */}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Wpisz swoje imię"
            placeholderTextColor="#52525B"
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
            className="bg-[#121214] text-white text-lg font-semibold rounded-2xl px-5 py-4 border border-[#27272A] text-center"
            style={{ fontSize: 18 }}
          />
        </View>

        {/* Bottom Button */}
        <View
          className="pb-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Button
            size="lg"
            disabled={!isStepValid}
            onPress={nextStep}
            className="w-full"
          >
            Dalej
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
