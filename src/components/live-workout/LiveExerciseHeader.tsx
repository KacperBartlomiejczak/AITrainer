import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { ChartLine, Dumbbell, Info, X } from "lucide-react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { LiveWorkoutExercise } from "@/schemas/live-workout.schema";

interface LiveExerciseHeaderProps {
  exercise: Pick<LiveWorkoutExercise, "id" | "catalogExerciseId" | "name" | "targetMuscle">;
  /** Photo + name: my progress (chart, max) */
  onShowProgress: () => void;
  /** ⓘ: how to do the exercise */
  onShowExercise: () => void;
  onRemove: () => void;
}

export function LiveExerciseHeader({ exercise, onShowProgress, onShowExercise, onRemove }: LiveExerciseHeaderProps) {
  const media = getExerciseMedia(exercise.catalogExerciseId);

  return (
    <View className="flex-row items-start justify-between gap-2">
      <Pressable
        testID={`exercise-progress-${exercise.id}`}
        onPress={onShowProgress}
        accessibilityRole="button"
        accessibilityLabel={`Twoje postępy: ${exercise.name}`}
        className="flex-1 flex-row items-center gap-3 active:opacity-70"
      >
        <View testID={`exercise-thumbnail-${exercise.id}`} className="w-14 h-14 rounded-xl bg-[#1E1E22] overflow-hidden items-center justify-center">
          {media ? <Image source={media.image} className="w-full h-full" resizeMode="cover" /> : <Dumbbell size={18} color="#71717A" />}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-black text-[#38BDF8]" numberOfLines={2}>
            {exercise.name}
          </Text>
          <View className="flex-row items-center gap-1">
            <ChartLine size={11} color="#71717A" />
            <Text className="text-xs text-[#71717A]">{exercise.targetMuscle} • postępy</Text>
          </View>
        </View>
      </Pressable>
      <Pressable
        testID={`exercise-info-${exercise.id}`}
        onPress={onShowExercise}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Instrukcja ćwiczenia ${exercise.name}`}
        className="w-8 h-8 rounded-full bg-[#1E1E22] items-center justify-center"
      >
        <Info size={14} color="#38BDF8" />
      </Pressable>
      <Pressable
        testID={`remove-exercise-${exercise.id}`}
        onPress={onRemove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Usuń ćwiczenie ${exercise.name}`}
        className="w-8 h-8 rounded-full bg-[#1E1E22] items-center justify-center"
      >
        <X size={14} color="#A1A1AA" />
      </Pressable>
    </View>
  );
}
