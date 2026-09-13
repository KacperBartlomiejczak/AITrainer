import React from "react";
import { View, Text } from "react-native";
import { WorkoutHistoryCard } from "./WorkoutHistoryCard";
import type { CompletedWorkoutDetail } from "@/schemas/user-profile-screen.schema";

interface RecentCompletedWorkoutsProps {
  workouts: CompletedWorkoutDetail[];
  onManagePhoto?: (workoutId: string) => void;
}

export function RecentCompletedWorkouts({ workouts, onManagePhoto }: RecentCompletedWorkoutsProps) {
  return (
    <View className="flex-col gap-3">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">
          ⏱️ Poprzednie Treningi ({workouts.length})
        </Text>
        {workouts.length > 0 && <Text className="text-xs text-[#71717A]">Przesuń kartę w lewo →</Text>}
      </View>

      {workouts.length === 0 ? (
        <View
          testID="recent-workouts-empty"
          className="rounded-2xl border border-dashed border-[#27272A] bg-[#121214] p-5 items-center gap-1"
        >
          <Text className="text-sm font-black text-white">Brak ukończonych treningów</Text>
          <Text className="text-xs text-[#71717A] text-center">
            Rozpocznij rutynę, a zakończony trening zapisze się tutaj
          </Text>
        </View>
      ) : (
        <View className="flex-col gap-4">
          {workouts.map((workout) => (
            <WorkoutHistoryCard key={workout.id} workout={workout} onManagePhoto={onManagePhoto} />
          ))}
        </View>
      )}
    </View>
  );
}
