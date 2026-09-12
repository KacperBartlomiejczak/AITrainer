import React from "react";
import { View, Text } from "react-native";
import { ExerciseGridCard } from "./ExerciseGridCard";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

interface ExerciseMuscleGroupSectionProps {
  title: string;
  emoji: string;
  exercises: CatalogExercise[];
  onPressPreview: (exercise: CatalogExercise) => void;
}

export function ExerciseMuscleGroupSection({
  title,
  emoji,
  exercises,
  onPressPreview,
}: ExerciseMuscleGroupSectionProps) {
  if (exercises.length === 0) {
    return (
      <View
        testID={`muscle-group-section-empty-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="items-center py-6"
      >
        <Text className="text-2xl mb-1">{emoji}</Text>
        <Text className="text-xs text-[#52525B]">Brak ćwiczeń w tej kategorii</Text>
      </View>
    );
  }

  // Build rows of 2
  const rows: [CatalogExercise, CatalogExercise | null][] = [];
  for (let i = 0; i < exercises.length; i += 2) {
    rows.push([exercises[i], exercises[i + 1] ?? null]);
  }

  return (
    <View className="gap-3">
      {/* Section header */}
      <View className="flex-row items-center gap-2">
        <Text className="text-base">{emoji}</Text>
        <Text className="text-sm font-black text-white tracking-tight">
          {title}
        </Text>
        <View className="flex-1 h-px bg-[#27272A]" />
        <Text className="text-[10px] text-[#52525B] font-medium">
          {exercises.length} ćw.
        </Text>
      </View>

      {/* 2-column grid */}
      <View className="gap-3">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-3">
            <ExerciseGridCard
              exercise={row[0]}
              onPressPreview={onPressPreview}
            />
            {row[1] ? (
              <ExerciseGridCard
                exercise={row[1]}
                onPressPreview={onPressPreview}
              />
            ) : (
              <View className="flex-1" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
