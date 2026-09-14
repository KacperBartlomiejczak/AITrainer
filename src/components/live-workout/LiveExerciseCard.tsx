import React from "react";
import { Pressable, Text, View } from "react-native";
import { Plus } from "lucide-react-native";
import { getSetLabels } from "@/lib/live-workout-stats";
import type { LiveWorkoutExercise, LiveWorkoutSetPatch, PersonalRecordHits } from "@/schemas/live-workout.schema";
import { MAX_SETS_PER_EXERCISE } from "@/schemas/workout-history.schema";
import type { ProgressSheetTarget } from "@/hooks/use-exercise-progress-sheet";
import { LiveExerciseHeader } from "./LiveExerciseHeader";
import { LiveSetRow } from "./LiveSetRow";

interface LiveExerciseCardProps {
  exercise: LiveWorkoutExercise;
  personalRecordHits: PersonalRecordHits;
  onUpdateSet: (exerciseId: string, setId: string, patch: LiveWorkoutSetPatch) => void;
  onToggleSet: (exerciseId: string, setId: string) => void;
  onPressSetLabel: (exerciseId: string, setId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  /** Opens "how to do it" for the catalog exercise */
  onShowExercise: (catalogExerciseId: string) => void;
  /** Opens the user's progress (chart, max) for the exercise */
  onShowProgress: (target: ProgressSheetTarget) => void;
}

const NO_RECORDS = [] as const;
const COLUMN_LABEL_CLASS = "text-[10px] font-bold uppercase tracking-wider text-[#71717A] text-center";

export function LiveExerciseCard({
  exercise,
  personalRecordHits,
  onUpdateSet,
  onToggleSet,
  onPressSetLabel,
  onAddSet,
  onRemoveExercise,
  onShowExercise,
  onShowProgress,
}: LiveExerciseCardProps) {
  const labels = getSetLabels(exercise.sets);
  const canAddSet = exercise.sets.length < MAX_SETS_PER_EXERCISE;

  return (
    <View testID={`live-exercise-${exercise.id}`} className="rounded-2xl bg-[#121214] border border-[#27272A] p-3 gap-2">
      <LiveExerciseHeader
        exercise={exercise}
        onShowExercise={() => onShowExercise(exercise.catalogExerciseId)}
        onShowProgress={() => onShowProgress({ catalogExerciseId: exercise.catalogExerciseId, name: exercise.name })}
        onRemove={() => onRemoveExercise(exercise.id)}
      />

      <View className="flex-row items-center gap-2 px-1.5">
        <Text className={`w-9 ${COLUMN_LABEL_CLASS}`}>Seria</Text>
        <Text className={`flex-1 ${COLUMN_LABEL_CLASS}`}>kg</Text>
        <Text className={`flex-1 ${COLUMN_LABEL_CLASS}`}>Powt.</Text>
        <View className="w-11" />
        <Text className={`w-9 ${COLUMN_LABEL_CLASS}`}>✓</Text>
      </View>

      {exercise.sets.map((set, index) => (
        <LiveSetRow
          key={set.id}
          set={set}
          label={labels[index] ?? String(index + 1)}
          records={personalRecordHits.get(set.id) ?? NO_RECORDS}
          onUpdate={(patch) => onUpdateSet(exercise.id, set.id, patch)}
          onToggle={() => onToggleSet(exercise.id, set.id)}
          onPressLabel={() => onPressSetLabel(exercise.id, set.id)}
        />
      ))}

      <Pressable
        testID={`add-set-${exercise.id}`}
        onPress={() => onAddSet(exercise.id)}
        disabled={!canAddSet}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canAddSet }}
        className={`flex-row items-center justify-center gap-1.5 rounded-xl bg-[#1E1E22] py-2.5 active:bg-[#27272A] ${
          canAddSet ? "" : "opacity-40"
        }`}
      >
        <Plus size={14} color="#FFFFFF" />
        <Text className="text-xs font-bold text-white">Dodaj serię</Text>
      </Pressable>
    </View>
  );
}
