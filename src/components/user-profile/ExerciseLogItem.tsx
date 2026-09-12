import React from "react";
import { View, Text } from "react-native";
import type { CompletedWorkoutExercise } from "@/schemas/user-profile-screen.schema";

interface ExerciseLogItemProps {
  exercise: CompletedWorkoutExercise;
}

export function ExerciseLogItem({ exercise }: ExerciseLogItemProps) {
  return (
    <View className="w-64 p-3 rounded-xl bg-[#18181B] border border-[#27272A] flex-col gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold text-white flex-1" numberOfLines={1}>
          {exercise.name}
        </Text>
        {exercise.isPersonalRecord && (
          <View className="bg-[#F59E0B]/20 px-1.5 py-0.5 rounded-full border border-[#F59E0B]/30 ml-1">
            <Text className="text-[9px] font-black text-[#F59E0B]">PR 🔥</Text>
          </View>
        )}
      </View>
      <Text className="text-xs text-[#38BDF8] font-semibold">
        {exercise.setsSummary}
      </Text>
      {exercise.recordNote && (
        <Text className="text-[10px] text-[#A1A1AA] italic" numberOfLines={1}>
          {exercise.recordNote}
        </Text>
      )}
    </View>
  );
}
