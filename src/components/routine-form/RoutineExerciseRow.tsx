import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import type { RoutineDraftExercise } from "@/schemas/routine-form.schema";

type ExerciseDraftPatch = Partial<Pick<RoutineDraftExercise, "sets" | "targetReps" | "restSeconds">>;

interface RoutineExerciseRowProps {
  exercise: RoutineDraftExercise;
  onChange: (patch: ExerciseDraftPatch) => void;
  onRemove: () => void;
}

function parsePositiveInt(text: string): number | null {
  const digitsOnly = text.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 0) return null;
  return Number(digitsOnly);
}

export function RoutineExerciseRow({ exercise, onChange, onRemove }: RoutineExerciseRowProps) {
  return (
    <View testID={`routine-exercise-${exercise.id}`} className="rounded-2xl bg-[#121214] border border-[#27272A] p-3.5 gap-3">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-bold text-white" numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text className="text-[11px] text-[#71717A]">{exercise.targetMuscle}</Text>
        </View>
        <Pressable
          testID={`routine-exercise-remove-${exercise.id}`}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Usuń ${exercise.name}`}
          className="w-8 h-8 rounded-full bg-[#1E1E22] items-center justify-center active:bg-[#27272A]"
        >
          <Trash2 size={14} color="#F87171" />
        </Pressable>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 gap-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Serie</Text>
          <TextInput
            testID={`routine-exercise-sets-${exercise.id}`}
            value={String(exercise.sets)}
            onChangeText={(text) => {
              const parsed = parsePositiveInt(text);
              if (parsed !== null) onChange({ sets: parsed });
            }}
            keyboardType="number-pad"
            className="rounded-lg bg-[#1E1E22] border border-[#27272A] px-2 py-2 text-xs text-white text-center"
          />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Powtórzenia</Text>
          <TextInput
            testID={`routine-exercise-reps-${exercise.id}`}
            value={exercise.targetReps}
            onChangeText={(text) => onChange({ targetReps: text })}
            className="rounded-lg bg-[#1E1E22] border border-[#27272A] px-2 py-2 text-xs text-white text-center"
          />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Przerwa (s)</Text>
          <TextInput
            testID={`routine-exercise-rest-${exercise.id}`}
            value={String(exercise.restSeconds)}
            onChangeText={(text) => {
              const parsed = parsePositiveInt(text);
              if (parsed !== null) onChange({ restSeconds: parsed });
            }}
            keyboardType="number-pad"
            className="rounded-lg bg-[#1E1E22] border border-[#27272A] px-2 py-2 text-xs text-white text-center"
          />
        </View>
      </View>
    </View>
  );
}
