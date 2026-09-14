import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import type { FilterOption } from "@/schemas/exercise-picker.schema";

interface FilterChipRowProps<T extends string> {
  testIDPrefix: string;
  accessibilityLabel: string;
  options: readonly FilterOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

/** Horizontally scrolling single-choice chips (muscle group, equipment…). */
export function FilterChipRow<T extends string>({
  testIDPrefix,
  accessibilityLabel,
  options,
  selected,
  onSelect,
}: FilterChipRowProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6 }}
      accessibilityLabel={accessibilityLabel}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const isSelected = option.id === selected;
        return (
          <Pressable
            key={option.id}
            testID={`${testIDPrefix}-${option.id}`}
            onPress={() => onSelect(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
              isSelected ? "bg-[#007AFF] border-[#007AFF]" : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
            }`}
          >
            <Text className="text-[11px]">{option.emoji}</Text>
            <Text className={`text-xs font-semibold ${isSelected ? "text-white" : "text-[#A1A1AA]"}`}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
