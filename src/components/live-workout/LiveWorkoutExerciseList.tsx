import React from "react";
import {
  MAX_LIVE_WORKOUT_EXERCISES,
  type LiveWorkoutExercise,
  type LiveWorkoutSetPatch,
  type PersonalRecordHits,
} from "@/schemas/live-workout.schema";
import type { ProgressSheetTarget } from "@/hooks/use-exercise-progress-sheet";
import { AddExerciseButton } from "./AddExerciseButton";
import { LiveExerciseCard } from "./LiveExerciseCard";
import { LiveWorkoutEmptyState } from "./LiveWorkoutEmptyState";

interface LiveWorkoutExerciseListProps {
  exercises: readonly LiveWorkoutExercise[];
  personalRecordHits: PersonalRecordHits;
  onUpdateSet: (exerciseId: string, setId: string, patch: LiveWorkoutSetPatch) => void;
  onToggleSet: (exerciseId: string, setId: string) => void;
  onPressSetLabel: (exerciseId: string, setId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onShowExercise: (catalogExerciseId: string) => void;
  onShowProgress: (target: ProgressSheetTarget) => void;
  onAddExercise: () => void;
}

export function LiveWorkoutExerciseList({ exercises, onAddExercise, ...cardProps }: LiveWorkoutExerciseListProps) {
  if (exercises.length === 0) {
    return <LiveWorkoutEmptyState onAddExercise={onAddExercise} />;
  }

  return (
    <>
      {exercises.map((exercise) => (
        <LiveExerciseCard key={exercise.id} exercise={exercise} {...cardProps} />
      ))}
      <AddExerciseButton disabled={exercises.length >= MAX_LIVE_WORKOUT_EXERCISES} onPress={onAddExercise} />
    </>
  );
}
