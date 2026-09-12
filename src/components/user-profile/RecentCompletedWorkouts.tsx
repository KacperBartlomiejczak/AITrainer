import React from "react";
import { View, Text } from "react-native";
import { WorkoutHistoryCard } from "./WorkoutHistoryCard";
import type { CompletedWorkoutDetail } from "@/schemas/user-profile-screen.schema";

interface RecentCompletedWorkoutsProps {
  workouts: CompletedWorkoutDetail[];
}

export function RecentCompletedWorkouts({
  workouts,
}: RecentCompletedWorkoutsProps) {
  return (
    <View className="flex-col gap-3">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">
          ⏱️ Poprzednie Treningi ({workouts.length})
        </Text>
        <Text className="text-xs text-[#71717A]">Przesuń kartę w lewo →</Text>
      </View>

      <View className="flex-col gap-4">
        {workouts.map((workout) => (
          <WorkoutHistoryCard key={workout.id} workout={workout} />
        ))}
      </View>
    </View>
  );
}
