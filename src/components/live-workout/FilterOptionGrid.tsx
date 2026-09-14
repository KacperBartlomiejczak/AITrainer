import React from "react";
import { Pressable, Text, View } from "react-native";
import type { FilterOption } from "@/schemas/exercise-picker.schema";

interface FilterOptionGridProps<T extends string> {
  title: string;
  testIDPrefix: string;
  options: readonly FilterOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

/** Wrapping single-choice buttons with a section title (bottom sheet filters). */
export function FilterOptionGrid<T extends string>({ title, testIDPrefix, options, selected, onSelect }: FilterOptionGridProps<T>) {
  return (
    <View className="gap-2.5">
      <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">{title}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.id === selected;
          return (
            <Pressable
              key={option.id}
              testID={`${testIDPrefix}-${option.id}`}
              onPress={() => onSelect(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={`flex-row items-center gap-2 rounded-xl border px-3.5 py-2.5 ${
                isSelected ? "bg-[#007AFF] border-[#007AFF]" : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
              }`}
            >
              <Text className="text-sm">{option.emoji}</Text>
              <Text className={`text-xs font-semibold ${isSelected ? "text-white" : "text-[#D4D4D8]"}`}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
