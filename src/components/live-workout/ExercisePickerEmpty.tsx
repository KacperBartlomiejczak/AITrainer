import React from "react";
import { Pressable, Text, View } from "react-native";

interface ExercisePickerEmptyProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function ExercisePickerEmpty({ hasActiveFilters, onResetFilters }: ExercisePickerEmptyProps) {
  return (
    <View className="items-center gap-3 pt-8">
      <Text className="text-sm text-center text-[#71717A]">Brak ćwiczeń dla wybranych filtrów</Text>
      {hasActiveFilters ? (
        <Pressable
          testID="exercise-picker-reset-filters"
          onPress={onResetFilters}
          accessibilityRole="button"
          className="rounded-xl bg-[#1E1E22] border border-[#27272A] px-4 py-2 active:bg-[#27272A]"
        >
          <Text className="text-xs font-bold text-white">Wyczyść filtry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
