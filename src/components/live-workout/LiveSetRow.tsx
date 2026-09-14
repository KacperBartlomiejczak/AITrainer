import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Check } from "lucide-react-native";
import { useSetInputs } from "@/hooks/use-set-inputs";
import { canCompleteSet } from "@/lib/live-workout-stats";
import { SET_TAG_META, type LiveWorkoutSet, type LiveWorkoutSetPatch } from "@/schemas/live-workout.schema";
import type { PersonalRecordType } from "@/schemas/workout-history.schema";
import { SetRecordBadges } from "./SetRecordBadges";

interface LiveSetRowProps {
  set: LiveWorkoutSet;
  /** "1", "2"… or "R" / "D" / "NU" */
  label: string;
  /** Records this set beats (empty = none) */
  records: readonly PersonalRecordType[];
  onUpdate: (patch: LiveWorkoutSetPatch) => void;
  onToggle: () => void;
  onPressLabel: () => void;
}

export const COMPLETED_SET_ROW_CLASS = "bg-[#16A34A]/25 border-[#22C55E]/60";
export const COMPLETED_SET_INPUT_CLASS = "bg-[#16A34A]/30";

const inputClass = (isInvalid: boolean, isCompleted: boolean) =>
  `flex-1 rounded-lg px-2 py-2 text-center text-sm font-bold text-white border ${
    isCompleted ? COMPLETED_SET_INPUT_CLASS : "bg-[#1E1E22]"
  } ${isInvalid ? "border-[#F87171]" : "border-transparent"}`;

export function LiveSetRow({ set, label, records, onUpdate, onToggle, onPressLabel }: LiveSetRowProps) {
  const inputs = useSetInputs(set, onUpdate);
  const canToggle = set.isCompleted || canCompleteSet(set);
  const tagColor = set.tag ? SET_TAG_META[set.tag].color : set.isCompleted ? "#4ADE80" : "#A1A1AA";

  return (
    <View
      testID={`set-row-${set.id}`}
      className={`flex-row items-center gap-2 rounded-xl border px-1.5 py-1 ${
        set.isCompleted ? COMPLETED_SET_ROW_CLASS : "border-transparent"
      }`}
    >
      <Pressable
        testID={`set-label-${set.id}`}
        onPress={onPressLabel}
        accessibilityRole="button"
        accessibilityLabel={`Seria ${label}. Zmień rodzaj serii`}
        className={`w-9 h-9 rounded-lg items-center justify-center ${set.isCompleted ? "bg-[#16A34A]/30" : "bg-[#1E1E22]"}`}
      >
        <Text className="text-sm font-black" style={{ color: tagColor }}>
          {label}
        </Text>
      </Pressable>

      <TextInput
        testID={`set-weight-${set.id}`}
        value={inputs.weightText}
        onChangeText={inputs.changeWeight}
        placeholder="kg"
        placeholderTextColor="#52525B"
        keyboardType="decimal-pad"
        accessibilityLabel={`Ciężar w kg, seria ${label}`}
        className={inputClass(inputs.isWeightInvalid, set.isCompleted)}
      />
      <TextInput
        testID={`set-reps-${set.id}`}
        value={inputs.repsText}
        onChangeText={inputs.changeReps}
        placeholder="powt."
        placeholderTextColor="#52525B"
        keyboardType="number-pad"
        accessibilityLabel={`Powtórzenia, seria ${label}`}
        className={inputClass(inputs.isRepsInvalid, set.isCompleted)}
      />

      <View className="w-11 items-center">
        <SetRecordBadges records={records} />
      </View>

      <Pressable
        testID={`set-toggle-${set.id}`}
        onPress={onToggle}
        disabled={!canToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`Seria ${label} wykonana`}
        accessibilityState={{ checked: set.isCompleted, disabled: !canToggle }}
        className={`w-9 h-9 rounded-lg items-center justify-center ${
          set.isCompleted ? "bg-[#22C55E]" : "bg-[#1E1E22]"
        } ${canToggle ? "" : "opacity-40"}`}
      >
        <Check size={18} color={set.isCompleted ? "#FFFFFF" : "#71717A"} />
      </Pressable>
    </View>
  );
}
