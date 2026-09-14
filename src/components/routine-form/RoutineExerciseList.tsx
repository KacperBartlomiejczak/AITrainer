import React from "react";
import { Text, View } from "react-native";
import { AddExerciseButton } from "@/components/live-workout/AddExerciseButton";
import { MAX_ROUTINE_EXERCISES, type RoutineDraftExercise } from "@/schemas/routine-form.schema";
import { RoutineExerciseRow } from "./RoutineExerciseRow";

type ExerciseDraftPatch = Partial<Pick<RoutineDraftExercise, "sets" | "targetReps" | "restSeconds">>;

interface RoutineExerciseListProps {
  exercises: readonly RoutineDraftExercise[];
  onChangeExercise: (id: string, patch: ExerciseDraftPatch) => void;
  onRemoveExercise: (id: string) => void;
  onAddExercise: () => void;
}

export function RoutineExerciseList({ exercises, onChangeExercise, onRemoveExercise, onAddExercise }: RoutineExerciseListProps) {
  return (
    <View className="flex-col gap-3">
      <Text className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Ćwiczenia</Text>

      {exercises.length === 0 ? (
        <View className="rounded-2xl bg-[#121214] border border-[#27272A] p-5 items-center">
          <Text className="text-sm text-[#71717A] text-center">Dodaj przynajmniej jedno ćwiczenie</Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {exercises.map((exercise) => (
            <RoutineExerciseRow
              key={exercise.id}
              exercise={exercise}
              onChange={(patch) => onChangeExercise(exercise.id, patch)}
              onRemove={() => onRemoveExercise(exercise.id)}
            />
          ))}
        </View>
      )}

      <AddExerciseButton disabled={exercises.length >= MAX_ROUTINE_EXERCISES} onPress={onAddExercise} />
    </View>
  );
}
