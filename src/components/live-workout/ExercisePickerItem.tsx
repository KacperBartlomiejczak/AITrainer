import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { ChevronRight, Dumbbell, Plus } from "lucide-react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

interface ExercisePickerItemProps {
  exercise: CatalogExercise;
  /** Row press: see how the exercise is done */
  onPreview: (exercise: CatalogExercise) => void;
  /** "+" press: add straight away */
  onAdd: (exercise: CatalogExercise) => void;
}

export function ExercisePickerItem({ exercise, onPreview, onAdd }: ExercisePickerItemProps) {
  const media = getExerciseMedia(exercise.id);

  return (
    <View className="flex-row items-center gap-2 rounded-2xl bg-[#121214] border border-[#27272A] p-2.5">
      <Pressable
        testID={`exercise-picker-item-${exercise.id}`}
        onPress={() => onPreview(exercise)}
        accessibilityRole="button"
        accessibilityLabel={`Zobacz, jak wykonać: ${exercise.name}`}
        className="flex-1 flex-row items-center gap-3 active:opacity-70"
      >
        <View className="w-12 h-12 rounded-xl bg-[#1E1E22] overflow-hidden items-center justify-center">
          {media ? (
            <Image source={media.image} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Dumbbell size={18} color="#71717A" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-white" numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text className="text-xs text-[#71717A]" numberOfLines={1}>
            {exercise.target} • {exercise.equipment}
          </Text>
        </View>
        <ChevronRight size={16} color="#52525B" />
      </Pressable>

      <Pressable
        testID={`exercise-picker-add-${exercise.id}`}
        onPress={() => onAdd(exercise)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Dodaj ćwiczenie ${exercise.name}`}
        className="w-10 h-10 rounded-xl bg-[#007AFF]/15 border border-[#007AFF]/30 items-center justify-center active:bg-[#007AFF]/30"
      >
        <Plus size={18} color="#007AFF" />
      </Pressable>
    </View>
  );
}
