import React from "react";
import { View, Text } from "react-native";
import { WorkoutExerciseItem } from "./WorkoutExerciseItem";
import type { WorkoutExerciseItem as WorkoutExerciseType } from "@/schemas/workout-session.schema";

interface WorkoutExercisesListProps {
  exercises: WorkoutExerciseType[];
  completedExerciseIds: string[];
  isActiveSession: boolean;
  onToggleExercise: (id: string) => void;
}

export function WorkoutExercisesList({
  exercises,
  completedExerciseIds,
  isActiveSession,
  onToggleExercise,
}: WorkoutExercisesListProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
          Plan Ćwiczeń
        </Text>
        {isActiveSession && (
          <Text className="text-xs text-[#007AFF] font-medium">
            Ukończono: {completedExerciseIds.length}/{exercises.length}
          </Text>
        )}
      </View>

      <View className="gap-2.5">
        {exercises.map((exercise, index) => (
          <WorkoutExerciseItem
            key={exercise.id}
            exercise={exercise}
            index={index}
            isCompleted={completedExerciseIds.includes(exercise.id)}
            isActiveSession={isActiveSession}
            onToggle={onToggleExercise}
          />
        ))}
      </View>
    </View>
  );
}
