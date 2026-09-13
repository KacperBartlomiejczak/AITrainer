import React from "react";
import { View, Text, Image } from "react-native";
import type { CompletedWorkoutDetail } from "@/schemas/user-profile-screen.schema";

interface WorkoutCoverSlideProps {
  workout: CompletedWorkoutDetail;
  cardWidth: number;
  activeSlide: number;
  totalSlides: number;
}

export function WorkoutCoverSlide({
  workout,
  cardWidth,
  activeSlide,
  totalSlides,
}: WorkoutCoverSlideProps) {
  return (
    <View style={{ width: cardWidth }} className="flex-col">
      <View
        style={{ width: cardWidth, height: 192 }}
        className="bg-[#18181B] overflow-hidden border-b border-[#27272A]"
      >
        {workout.photoUri && (
          <Image
            testID={`workout-cover-image-${workout.id}`}
            source={{ uri: workout.photoUri }}
            accessibilityLabel={`Zdjęcie z treningu ${workout.title}`}
            style={{ width: cardWidth, height: 192 }}
            resizeMode="cover"
          />
        )}
      </View>
      <View className="p-4 flex-col gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold text-[#38BDF8]">
            {workout.completedDate} • {workout.durationMinutes} min
          </Text>
          <View className="bg-[#1E1E22] px-2 py-0.5 rounded-full border border-[#27272A]">
            <Text className="text-[11px] font-bold text-[#A1A1AA]">
              {workout.completedExerciseCount}/{workout.exercises.length} ćwiczeń
            </Text>
          </View>
        </View>
        <Text className="text-base font-black text-white" numberOfLines={1}>
          {workout.title}
        </Text>
        <Text className="text-[11px] font-bold text-[#38BDF8] pt-1">
          Przesuń w lewo po ćwiczenia → ({activeSlide + 1}/{totalSlides})
        </Text>
      </View>
    </View>
  );
}
