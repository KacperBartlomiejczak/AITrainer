import React from "react";
import { Pressable, Text, View } from "react-native";
import { ListPlus, Play } from "lucide-react-native";

interface WorkoutQuickActionsProps {
  /** An empty workout is already running → the button resumes it */
  hasActiveWorkout: boolean;
  onStartEmptyWorkout: () => void;
  onCreateRoutine: () => void;
}

export function WorkoutQuickActions({ hasActiveWorkout, onStartEmptyWorkout, onCreateRoutine }: WorkoutQuickActionsProps) {
  return (
    <View className="flex-row gap-2.5">
      <Pressable
        testID="start-empty-workout-button"
        onPress={onStartEmptyWorkout}
        accessibilityRole="button"
        className="flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#007AFF] px-3 py-4 active:bg-[#0062CC]"
      >
        <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
        <Text className="text-sm font-bold text-white text-center">
          {hasActiveWorkout ? "Wróć do treningu" : "Rozpocznij pusty trening"}
        </Text>
      </Pressable>

      <Pressable
        testID="create-routine-button"
        onPress={onCreateRoutine}
        accessibilityRole="button"
        className="flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#121214] border border-[#27272A] px-3 py-4 active:bg-[#1E1E22]"
      >
        <ListPlus size={18} color="#FFFFFF" />
        <Text className="text-sm font-bold text-white text-center">Stwórz nową rutynę</Text>
      </Pressable>
    </View>
  );
}
