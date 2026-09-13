import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { getSelectedMuscleGroups, isUndecidedMuscleFocus } from "@/lib/muscle-focus";
import { EXPERIENCE_LEVEL_LABELS } from "@/schemas/onboarding.schema";
import {
  ProfileHeaderCard,
  ProfileNameSection,
  ProfileExperienceSection,
  ProfileGoalSection,
  ProfileMuscleGroupsSection,
  ProfileSettingsSection,
} from "@/components/profile";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    name,
    experienceLevel,
    fitnessGoal,
    muscleFocus,
    errors,
    isDirty,
    isSuccess,
    setName,
    setExperienceLevel,
    setFitnessGoal,
    toggleMuscleGroup,
    toggleUndecidedMuscleFocus,
    saveProfile,
    exportData,
    resetAllData,
  } = useProfile();

  const handleExport = async () => {
    try {
      const json = await exportData();
      Alert.alert("Eksport danych", `Twoje dane zostały przygotowane:\n${json.slice(0, 100)}...`, [
        { text: "OK" },
      ]);
    } catch (error: unknown) {
      console.error("[profile] Failed to export user data", error);
      Alert.alert("Eksport danych", "Nie udało się przygotować danych. Spróbuj ponownie.", [{ text: "OK" }]);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Resetowanie profilu",
      "Czy na pewno chcesz usunąć swoje dane i powtórzyć onboarding?",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń dane",
          style: "destructive",
          onPress: () => {
            resetAllData();
            router.replace("/(onboarding)/step-name");
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: Math.max(insets.top, 16) }}>
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 pb-3 border-b border-[#27272A]">
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-[#121214] border border-[#27272A] items-center justify-center active:bg-[#1E1E22]"
        >
          <Text className="text-white text-base font-bold">←</Text>
        </Pressable>
        <Text className="text-base font-black text-white">Profil i Ustawienia</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 24) + 40,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeaderCard
          name={name}
          streakDays={4}
          level={experienceLevel ? EXPERIENCE_LEVEL_LABELS[experienceLevel].label : undefined}
        />

        {isSuccess && (
          <View className="rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 p-3 items-center">
            <Text className="text-sm font-bold text-[#10B981]">Zapisano pomyślnie! ✓</Text>
          </View>
        )}

        <ProfileNameSection name={name} onChangeName={setName} error={errors.name} />

        <ProfileExperienceSection
          selectedLevel={experienceLevel}
          onSelectLevel={setExperienceLevel}
          error={errors.experienceLevel}
        />

        <ProfileGoalSection
          selectedGoal={fitnessGoal}
          onSelectGoal={setFitnessGoal}
          error={errors.fitnessGoal}
        />

        <ProfileMuscleGroupsSection
          selectedGroups={getSelectedMuscleGroups(muscleFocus)}
          isUndecided={isUndecidedMuscleFocus(muscleFocus)}
          onToggleGroup={toggleMuscleGroup}
          onToggleUndecided={toggleUndecidedMuscleFocus}
          error={errors.muscleFocus}
        />

        <Button size="lg" onPress={saveProfile} className="w-full">
          {isDirty ? "Zapisz zmiany" : "Zapisz zmiany"}
        </Button>

        <ProfileSettingsSection onExportData={() => void handleExport()} onResetData={handleReset} />
      </ScrollView>
    </View>
  );
}
