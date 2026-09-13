import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useWorkoutDetail } from "@/hooks/use-workout-detail";
import {
  WorkoutDetailHeader,
  WorkoutExercisesList,
  WorkoutStartButton,
} from "@/components/workout";

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    routine,
    isActive,
    completedExerciseIds,
    startWorkout,
    finishWorkout,
    toggleExercise,
    backToWorkouts,
  } = useWorkoutDetail(id);

  if (!routine) {
    return (
      <View
        className="flex-1 bg-black justify-center items-center px-6"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <Text className="text-xl font-bold text-white mb-2">
          Nie znaleziono treningu
        </Text>
        <Text className="text-sm text-[#71717A] text-center mb-6">
          Wybrana rutyna nie istnieje lub została usunięta.
        </Text>
        <Pressable
          testID="workout-not-found-back-button"
          onPress={backToWorkouts}
          accessibilityRole="button"
          accessibilityLabel="Wróć do listy treningów"
          className="bg-[#007AFF] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Wróć do treningów</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <WorkoutDetailHeader routine={routine} onBack={backToWorkouts} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 24) + 32,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <WorkoutExercisesList
          exercises={routine.exercises}
          completedExerciseIds={completedExerciseIds}
          isActiveSession={isActive}
          onToggleExercise={toggleExercise}
        />

        <WorkoutStartButton
          isActive={isActive}
          onStart={startWorkout}
          onFinish={finishWorkout}
        />
      </ScrollView>
    </View>
  );
}
