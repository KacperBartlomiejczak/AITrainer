import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LiveWorkoutExerciseList,
  LiveWorkoutFinishModal,
  LiveWorkoutHeader,
  LiveWorkoutOverlays,
  LiveWorkoutStatsBar,
  WorkoutMuscleMap,
} from "@/components/live-workout";
import { useExercisePicker } from "@/hooks/use-exercise-picker";
import { useExercisePreview } from "@/hooks/use-exercise-preview";
import { useExerciseProgressSheet } from "@/hooks/use-exercise-progress-sheet";
import { useFinishLiveWorkout } from "@/hooks/use-finish-live-workout";
import { useLiveWorkout } from "@/hooks/use-live-workout";
import type { CatalogExercise } from "@/schemas/exercise-catalog.schema";

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();
  const workout = useLiveWorkout();
  const picker = useExercisePicker();
  const preview = useExercisePreview();
  const progress = useExerciseProgressSheet();
  const finish = useFinishLiveWorkout({ personalRecordHits: workout.personalRecordHits });

  const pickExercise = (exercise: CatalogExercise) => {
    workout.addExercise(exercise);
    picker.close();
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: Math.max(insets.top, 16) }}>
      <LiveWorkoutHeader onBack={workout.goBack} onDiscard={workout.confirmDiscard} onFinish={finish.openSummary} />

      <KeyboardAvoidingView
        testID="workout-session-keyboard-avoiding"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 24) + 32, gap: 14 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LiveWorkoutStatsBar
            elapsedSeconds={workout.elapsedSeconds}
            completedSetCount={workout.stats.completedSetCount}
            totalVolumeKg={workout.stats.totalVolumeKg}
          />
          <WorkoutMuscleMap trainedMuscles={workout.stats.trainedMuscles} />

          {finish.errorMessage && !finish.isSummaryOpen ? (
            <Text accessibilityRole="alert" className="text-sm font-semibold text-center text-[#F87171]">
              {finish.errorMessage}
            </Text>
          ) : null}

          <LiveWorkoutExerciseList
            exercises={workout.exercises}
            personalRecordHits={workout.personalRecordHits}
            onUpdateSet={workout.updateSet}
            onToggleSet={workout.toggleSetCompleted}
            onPressSetLabel={workout.openTagDialog}
            onAddSet={workout.addSet}
            onRemoveExercise={workout.removeExercise}
            onShowExercise={preview.openPreview}
            onShowProgress={progress.open}
            onAddExercise={picker.open}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <LiveWorkoutOverlays
        workout={workout}
        picker={picker}
        preview={preview}
        progress={progress}
        onAddExercise={pickExercise}
      />
      <LiveWorkoutFinishModal
        finish={finish}
        stats={workout.stats}
        elapsedSeconds={workout.elapsedSeconds}
        personalRecordCount={workout.personalRecordCount}
      />
    </View>
  );
}
