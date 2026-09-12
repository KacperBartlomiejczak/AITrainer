import React from "react";
import { ScrollView, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import type { ExerciseCategoryFilter } from "@/schemas/exercise-catalog.schema";

interface ExerciseFilterChipsProps {
  selectedCategory: ExerciseCategoryFilter;
  onSelectCategory: (category: ExerciseCategoryFilter) => void;
}

const CATEGORY_CHIPS: {
  id: ExerciseCategoryFilter;
  label: string;
  emoji: string;
}[] = [
  { id: "all", label: "Wszystkie", emoji: "🏋️" },
  { id: "chest", label: "Klatka", emoji: "💪" },
  { id: "back", label: "Plecy", emoji: "🔙" },
  { id: "upper legs", label: "Nogi", emoji: "🦵" },
  { id: "upper arms", label: "Ramiona", emoji: "💪" },
  { id: "shoulders", label: "Barki", emoji: "🏃" },
  { id: "waist", label: "Brzuch", emoji: "🎯" },
  { id: "cardio", label: "Cardio", emoji: "❤️" },
  { id: "lower legs", label: "Łydki", emoji: "🦶" },
];

export function ExerciseFilterChips({
  selectedCategory,
  onSelectCategory,
}: ExerciseFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      className="py-1"
    >
      {CATEGORY_CHIPS.map((chip) => {
        const isSelected = selectedCategory === chip.id;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelectCategory(chip.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={cn(
              "flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full border",
              isSelected
                ? "bg-[#007AFF] border-[#007AFF]"
                : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
            )}
          >
            <Text className="text-[11px]">{chip.emoji}</Text>
            <Text
              className={cn(
                "text-xs font-semibold",
                isSelected ? "text-white" : "text-[#A1A1AA]"
              )}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
