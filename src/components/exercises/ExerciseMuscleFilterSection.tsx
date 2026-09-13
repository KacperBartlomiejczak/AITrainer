import React from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import type { ExerciseCategoryFilter } from "@/schemas/exercise-catalog.schema";

interface ExerciseMuscleFilterSectionProps {
  selectedCategory: ExerciseCategoryFilter;
  onSelectCategory: (category: ExerciseCategoryFilter) => void;
}

const MUSCLE_OPTIONS: {
  id: ExerciseCategoryFilter;
  label: string;
  emoji: string;
}[] = [

  { id: "all", label: "Wszystkie partie", emoji: "🏋️" },
  { id: "chest", label: "Klatka piersiowa", emoji: "💪" },
  { id: "back", label: "Plecy", emoji: "🔙" },
  { id: "upper legs", label: "Nogi", emoji: "🦵" },
  { id: "upper arms", label: "Ramiona", emoji: "💪" },
  { id: "shoulders", label: "Barki", emoji: "🏃" },
  { id: "waist", label: "Brzuch", emoji: "🎯" },
  { id: "cardio", label: "Cardio", emoji: "❤️" },
  { id: "lower legs", label: "Łydki", emoji: "🦶" },
];

export function ExerciseMuscleFilterSection({
  selectedCategory,
  onSelectCategory,
}: ExerciseMuscleFilterSectionProps) {
  return (
    <View className="gap-2.5">
      <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
        Partia mięśniowa
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {MUSCLE_OPTIONS.map((item) => {
          const isSelected = selectedCategory === item.id;
          return (
            <Pressable
              key={item.id}
              testID={`muscle-filter-${item.id}`}
              onPress={() => onSelectCategory(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={cn(
                "flex-row items-center gap-1.5 px-3 py-2 rounded-xl border",
                isSelected
                  ? "bg-[#007AFF] border-[#007AFF]"
                  : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
              )}
            >
              <Text className="text-sm">{item.emoji}</Text>
              <Text
                className={cn(
                  "text-xs font-semibold",
                  isSelected ? "text-white" : "text-[#D4D4D8]"
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
