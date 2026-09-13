import React from "react";
import { View, Text, Pressable } from "react-native";
import { CheckCircle2, Circle } from "lucide-react-native";
import type { WorkoutExerciseItem as WorkoutExerciseType } from "@/schemas/workout-session.schema";

interface WorkoutExerciseItemProps {
  exercise: WorkoutExerciseType;
  index: number;
  isCompleted: boolean;
  isActiveSession: boolean;
  onToggle: (id: string) => void;
}

export function WorkoutExerciseItem({
  exercise,
  index,
  isCompleted,
  isActiveSession,
  onToggle,
}: WorkoutExerciseItemProps) {
  return (
    <Pressable
      testID={`workout-exercise-item-${exercise.id}`}
      onPress={() => isActiveSession && onToggle(exercise.id)}
      disabled={!isActiveSession}
      accessibilityRole="button"
      accessibilityLabel={`Ćwiczenie ${index + 1}: ${exercise.name}`}
      className={`p-3.5 rounded-2xl border transition-colors ${
        isCompleted
          ? "bg-[#0A2612]/30 border-[#1B5E20]/50"
          : "bg-[#121214] border-[#27272A]"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-6 h-6 rounded-full bg-[#1E1E22] items-center justify-center">
            <Text className="text-xs font-bold text-[#A1A1AA]">{index + 1}</Text>
          </View>
          <View className="flex-1">
            <Text
              className={`text-sm font-bold ${
                isCompleted ? "text-[#81C784] line-through" : "text-white"
              }`}
              numberOfLines={1}
            >
              {exercise.name}
            </Text>
            <Text className="text-xs text-[#71717A] mt-0.5">
              {exercise.targetMuscle} • {exercise.sets} serie × {exercise.targetReps}
            </Text>
          </View>
        </View>

        {isActiveSession && (
          <View className="pl-2">
            {isCompleted ? (
              <CheckCircle2 size={22} color="#4CAF50" />
            ) : (
              <Circle size={22} color="#52525B" />
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
