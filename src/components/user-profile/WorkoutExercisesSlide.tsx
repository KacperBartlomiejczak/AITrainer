import React from "react";
import { View, Text } from "react-native";
import type { CompletedWorkoutExercise } from "@/schemas/user-profile-screen.schema";

interface WorkoutExercisesSlideProps {
  exercises: CompletedWorkoutExercise[];
  workoutId: string;
  cardWidth?: number;
  showCoverMeta?: boolean;
  workoutTitle?: string;
  completedMeta?: string;
  activeSlide?: number;
  totalSlides?: number;
}

export function WorkoutExercisesSlide({
  exercises,
  workoutId,
  cardWidth,
  showCoverMeta,
  workoutTitle,
  completedMeta,
  activeSlide = 0,
  totalSlides = 2,
}: WorkoutExercisesSlideProps) {
  const content = (
    <View testID={`exercises-slide-${workoutId}`} className="flex-col gap-2 p-3.5">
      {showCoverMeta && (
        <View className="pb-1 flex-col gap-0.5">
          <Text className="text-xs font-bold text-[#38BDF8]">{completedMeta}</Text>
          <Text className="text-base font-black text-white" numberOfLines={1}>
            {workoutTitle}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between pb-1 border-b border-[#27272A]/70">
        <Text className="text-xs font-black uppercase tracking-wider text-[#38BDF8]">
          ⚡ Wykonane Ćwiczenia ({exercises.length})
        </Text>
        <Text className="text-[10px] text-[#71717A]">Przesuń w lewo →</Text>
      </View>

      <View className="flex-col gap-2">
        {exercises.map((ex) => (
          <View
            key={ex.id}
            className="p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] flex-col gap-1"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold text-white flex-1" numberOfLines={1}>
                {ex.name}
              </Text>
              {ex.isPersonalRecord && (
                <View className="bg-[#F59E0B]/20 px-1.5 py-0.5 rounded-full border border-[#F59E0B]/30 ml-1">
                  <Text className="text-[9px] font-black text-[#F59E0B]">PR 🔥</Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-[#38BDF8] font-semibold">{ex.setsSummary}</Text>
          </View>
        ))}
      </View>

      <View className="pt-1">
        <Text className="text-[11px] font-bold text-[#F59E0B]">
          Przesuń w lewo po osiągnięcia → ({activeSlide + 1}/{totalSlides})
        </Text>
      </View>
    </View>
  );

  if (cardWidth) {
    return <View style={{ width: cardWidth }}>{content}</View>;
  }
  return content;
}
