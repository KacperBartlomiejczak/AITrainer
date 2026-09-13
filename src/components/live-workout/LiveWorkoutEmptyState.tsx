import React from "react";
import { Pressable, Text, View } from "react-native";
import { Plus } from "lucide-react-native";

interface LiveWorkoutEmptyStateProps {
  onAddExercise: () => void;
}

export function LiveWorkoutEmptyState({ onAddExercise }: LiveWorkoutEmptyStateProps) {
  return (
    <View className="items-center rounded-3xl border border-dashed border-[#27272A] px-6 py-8 gap-2">
      <Text className="text-3xl">🏋️</Text>
      <Text className="text-base font-black text-white">Zacznij od pierwszego ćwiczenia</Text>
      <Text className="text-xs text-center text-[#71717A]">
        Dodaj ćwiczenie z bazy, wpisuj ciężar i powtórzenia, a potem odhaczaj serie.
      </Text>
      <Pressable
        testID="empty-add-exercise"
        onPress={onAddExercise}
        accessibilityRole="button"
        className="flex-row items-center gap-2 mt-2 rounded-2xl bg-[#007AFF] px-5 py-3 active:bg-[#0062CC]"
      >
        <Plus size={16} color="#FFFFFF" />
        <Text className="text-sm font-bold text-white">Dodaj ćwiczenie</Text>
      </Pressable>
    </View>
  );
}
