import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Play } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { getExerciseMedia } from "@/lib/exercise-assets";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

interface ExerciseCardProps {
  exercise: CatalogExercise;
  onPressPreview: (exercise: CatalogExercise) => void;
}

export function ExerciseCard({ exercise, onPressPreview }: ExerciseCardProps) {
  const media = getExerciseMedia(exercise.id);

  return (
    <Pressable
      testID={`exercise-card-${exercise.id}`}
      onPress={() => onPressPreview(exercise)}
      accessibilityRole="button"
      className="flex-row items-center bg-[#121214] border border-[#27272A] rounded-2xl p-3 gap-3.5 active:bg-[#18181B]"
    >
      <View className="relative w-18 h-18 rounded-xl bg-[#1E1E22] overflow-hidden items-center justify-center border border-[#27272A]">
        {media ? (
          <Image
            source={media.image}
            className="w-full h-full object-cover"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-2xl">🏋️</Text>
        )}
        <View className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/75 items-center justify-center">
          <Play size={9} color="#007AFF" fill="#007AFF" />
        </View>
      </View>

      <View className="flex-1 flex-col gap-1.5">
        <Text
          className="text-sm font-bold text-white tracking-tight"
          numberOfLines={2}
        >
          {exercise.name}
        </Text>

        <View className="flex-row flex-wrap items-center gap-1.5">
          <Badge
            variant="default"
            size="sm"
            className="bg-[#007AFF]/15 border-[#007AFF]/30 px-2 py-0.5"
          >
            <Text className="text-[10px] font-semibold text-[#007AFF]">
              {exercise.target}
            </Text>
          </Badge>
          <Badge
            variant="outline"
            size="sm"
            className="bg-[#1E1E22] border-[#27272A] px-2 py-0.5"
          >
            <Text className="text-[10px] text-[#A1A1AA]">
              {exercise.equipment}
            </Text>
          </Badge>
        </View>
      </View>
    </Pressable>
  );
}
