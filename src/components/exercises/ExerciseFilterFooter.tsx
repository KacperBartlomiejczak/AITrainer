import React from "react";
import { View, Text, Pressable } from "react-native";
import { RotateCcw, Check } from "lucide-react-native";

interface ExerciseFilterFooterProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onApply: () => void;
  totalResultsCount: number;
}

export function ExerciseFilterFooter({
  hasActiveFilters,
  onResetFilters,
  onApply,
  totalResultsCount,
}: ExerciseFilterFooterProps) {
  return (
    <View className="flex-row items-center gap-3 p-4 border-t border-[#1E1E22] bg-[#0E0E11]">
      <Pressable
        testID="reset-filters-button"
        onPress={onResetFilters}
        disabled={!hasActiveFilters}
        accessibilityRole="button"
        accessibilityLabel="Wyczyść filtry"
        className="flex-row items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-[#27272A] bg-[#141417] disabled:opacity-40"
      >
        <RotateCcw size={15} color="#A1A1AA" />
        <Text className="text-xs font-semibold text-[#D4D4D8]">Wyczyść</Text>
      </Pressable>

      <Pressable
        testID="apply-filters-button"
        onPress={onApply}
        accessibilityRole="button"
        accessibilityLabel="Zastosuj filtry"
        className="flex-1 flex-row items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#007AFF] active:bg-[#0062CC]"
      >
        <Check size={16} color="#FFFFFF" />
        <Text className="text-xs font-bold text-white">
          Pokaż ćwiczenia ({totalResultsCount})
        </Text>
      </Pressable>
    </View>
  );
}
