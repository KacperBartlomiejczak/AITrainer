import React from "react";
import { TextInput, View } from "react-native";
import { Search } from "lucide-react-native";
import { ExerciseFilterButton } from "@/components/exercises/ExerciseFilterButton";

interface ExercisePickerSearchRowProps {
  query: string;
  activeFilterCount: number;
  onChangeQuery: (query: string) => void;
  onOpenFilters: () => void;
}

export function ExercisePickerSearchRow({ query, activeFilterCount, onChangeQuery, onOpenFilters }: ExercisePickerSearchRowProps) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-[#121214] border border-[#27272A] px-3">
        <Search size={16} color="#71717A" />
        <TextInput
          testID="exercise-picker-search"
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Szukaj ćwiczenia"
          placeholderTextColor="#52525B"
          autoCorrect={false}
          className="flex-1 py-3 text-sm text-white"
        />
      </View>
      <ExerciseFilterButton testID="exercise-picker-filters-button" activeCount={activeFilterCount} onPress={onOpenFilters} />
    </View>
  );
}
