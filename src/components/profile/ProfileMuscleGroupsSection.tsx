import * as React from "react";
import { View, Text, Pressable } from "react-native";
import {
  MUSCLE_GROUP_LABELS,
  MuscleGroupSchema,
  UNDECIDED_MUSCLE_FOCUS_LABEL,
  type MuscleGroup,
} from "@/schemas/onboarding.schema";

interface ProfileMuscleGroupsSectionProps {
  selectedGroups: MuscleGroup[];
  isUndecided: boolean;
  onToggleGroup: (group: MuscleGroup) => void;
  onToggleUndecided: () => void;
  error?: string;
}

interface MuscleChipProps {
  testID?: string;
  emoji: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function MuscleChip({ testID, emoji, label, isSelected, onPress }: MuscleChipProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      className={`flex-row items-center gap-2 rounded-xl px-3.5 py-2.5 border min-w-[48%] flex-1 transition-colors ${
        isSelected
          ? "bg-[#007AFF]/15 border-[#007AFF]"
          : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
      }`}
    >
      <Text className="text-lg">{emoji}</Text>
      <Text
        className={`text-xs font-bold flex-1 ${isSelected ? "text-[#007AFF]" : "text-[#D4D4D8]"}`}
        numberOfLines={1}
      >
        {label}
      </Text>
      {isSelected && (
        <View className="w-4 h-4 rounded-full bg-[#007AFF] items-center justify-center">
          <Text className="text-[9px] font-black text-white">✓</Text>
        </View>
      )}
    </Pressable>
  );
}

export function ProfileMuscleGroupsSection({
  selectedGroups,
  isUndecided,
  onToggleGroup,
  onToggleUndecided,
  error,
}: ProfileMuscleGroupsSectionProps) {
  return (
    <View className="flex-col gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
          Priorytetowe Partie Mięśniowe ({selectedGroups.length})
        </Text>
        <Text className="text-[11px] text-[#71717A]">Min. 1 lub „nie wiem”</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {MuscleGroupSchema.options.map((group) => (
          <MuscleChip
            key={group}
            {...MUSCLE_GROUP_LABELS[group]}
            isSelected={selectedGroups.includes(group)}
            onPress={() => onToggleGroup(group)}
          />
        ))}
        <MuscleChip
          testID="profile-muscle-focus-undecided"
          emoji={UNDECIDED_MUSCLE_FOCUS_LABEL.emoji}
          label={UNDECIDED_MUSCLE_FOCUS_LABEL.label}
          isSelected={isUndecided}
          onPress={onToggleUndecided}
        />
      </View>

      {error ? <Text className="text-xs font-medium text-red-500">{error}</Text> : null}
    </View>
  );
}
