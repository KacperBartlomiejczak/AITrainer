import React from "react";
import { ScrollView, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import type { ExerciseCategoryFilter } from "@/schemas/exercise-catalog.schema";

interface ExerciseFilterChipsProps {
  selectedCategory: ExerciseCategoryFilter;
  onSelectCategory: (category: ExerciseCategoryFilter) => void;
}

const CATEGORY_CHIPS: { id: ExerciseCategoryFilter; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "chest", label: "Klatka" },
  { id: "back", label: "Plecy" },
  { id: "legs", label: "Nogi" },
  { id: "arms", label: "Ramiona" },
  { id: "shoulders", label: "Barki" },
  { id: "waist", label: "Brzuch" },
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
              "px-3.5 py-1.5 rounded-full border transition-all active:scale-95",
              isSelected
                ? "bg-[#007AFF] border-[#007AFF] shadow-sm shadow-[#007AFF]/40"
                : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
            )}
          >
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
