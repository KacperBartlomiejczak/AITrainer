import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoutines } from "@/hooks/use-routines";
import {
  ExercisesHeroBanner,
  RoutineListSection,
  WorkoutQuickActions,
} from "@/components/workouts";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    filteredRoutines,
    startRoutine,
    hasActiveEmptyWorkout,
    startEmptyWorkout,
    openAllExercises,
    deleteRoutine,
  } = useRoutines();

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 24) + 80,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-col gap-8">
          {/* Header */}
          <View className="flex-col gap-1">
            <Text className="text-2xl font-black text-white tracking-tight">
              Treningi & Rutyny 🏋️
            </Text>
            <Text className="text-xs text-[#71717A]">
              Eksploruj gotowe plany lub przeglądaj pełną bazę ćwiczeń
            </Text>
          </View>

          <WorkoutQuickActions
            hasActiveWorkout={hasActiveEmptyWorkout}
            onStartEmptyWorkout={startEmptyWorkout}
            onCreateRoutine={() => router.push("/routine/new" as never)}
          />

          {/* Hero Banner with "Pokaż wszystkie ćwiczenia" button */}
          <ExercisesHeroBanner onPressShowAll={openAllExercises} />

          {/* Routines List */}
          <RoutineListSection
            routines={filteredRoutines}
            onStartRoutine={startRoutine}
            onDeleteRoutine={deleteRoutine}
          />
        </View>
      </ScrollView>
    </View>
  );
}
