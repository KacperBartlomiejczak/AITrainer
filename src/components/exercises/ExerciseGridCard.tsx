import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Play } from "lucide-react-native";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

interface ExerciseGridCardProps {
  exercise: CatalogExercise;
  onPressPreview: (exercise: CatalogExercise) => void;
}

export function ExerciseGridCard({
  exercise,
  onPressPreview,
}: ExerciseGridCardProps) {
  const media = getExerciseMedia(exercise.id);

  return (
    <Pressable
      testID={`exercise-grid-card-${exercise.id}`}
      onPress={() => onPressPreview(exercise)}
      accessibilityRole="button"
      accessibilityLabel={`Ćwiczenie: ${exercise.name}`}
      className="flex-1 bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden active:opacity-80"
    >
      {/* Thumbnail */}
      <View className="w-full aspect-square bg-[#1E1E22] items-center justify-center relative">
        {media ? (
          <Image
            source={media.image}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-3xl">🏋️</Text>
        )}

        {/* Play overlay */}
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="w-9 h-9 rounded-full bg-black/60 border border-white/20 items-center justify-center">
            <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </View>

        {/* Equipment badge */}
        <View className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded-full">
          <Text className="text-[9px] text-white/80 font-medium">
            {exercise.equipment}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className="p-2.5 gap-1">
        <Text
          className="text-xs font-bold text-white leading-snug"
          numberOfLines={2}
        >
          {exercise.name}
        </Text>
        <Text className="text-[10px] text-[#007AFF] font-semibold" numberOfLines={1}>
          {exercise.target}
        </Text>
      </View>
    </Pressable>
  );
}
