import React from "react";
import { View, Text } from "react-native";
import type { CompletedWorkoutAchievement } from "@/schemas/user-profile-screen.schema";

interface WorkoutAchievementsSlideProps {
  achievements?: CompletedWorkoutAchievement[];
  workoutId: string;
  cardWidth?: number;
  activeSlide?: number;
  totalSlides?: number;
}

export function WorkoutAchievementsSlide({
  achievements = [],
  workoutId,
  cardWidth,
  activeSlide = 1,
  totalSlides = 2,
}: WorkoutAchievementsSlideProps) {
  const content = (
    <View testID={`achievements-slide-${workoutId}`} className="flex-col gap-2 p-3.5">
      <View className="flex-row items-center justify-between pb-1 border-b border-[#27272A]/70">
        <Text className="text-xs font-black uppercase tracking-wider text-[#F59E0B]">
          🏆 Zdobyte Osiągnięcia ({achievements.length})
        </Text>
        <Text className="text-[10px] text-[#71717A]">Ostatni slajd ✓</Text>
      </View>

      {achievements.length === 0 ? (
        <View className="py-4 items-center justify-center">
          <Text className="text-xs text-[#71717A] italic">
            Solidny trening bazowy bez nowych rekordów
          </Text>
        </View>
      ) : (
        <View className="flex-col gap-2">
          {achievements.map((ach) => (
            <View
              key={ach.id}
              className="flex-row items-center gap-2.5 p-2.5 rounded-xl bg-[#18181B] border border-[#27272A]"
            >
              <Text className="text-lg">{ach.icon}</Text>
              <View className="flex-1 flex-col">
                <Text className="text-xs font-bold text-white" numberOfLines={1}>
                  {ach.title}
                </Text>
                <Text className="text-[11px] text-[#A1A1AA]" numberOfLines={1}>
                  {ach.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="pt-1">
        <Text className="text-[10px] text-[#71717A] italic">
          Podsumowanie treningu ({activeSlide + 1}/{totalSlides})
        </Text>
      </View>
    </View>
  );

  if (cardWidth) {
    return <View style={{ width: cardWidth }}>{content}</View>;
  }
  return content;
}
