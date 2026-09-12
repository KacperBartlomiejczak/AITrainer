import * as React from "react";
import { View, Text, Pressable } from "react-native";
import {
  MUSCLE_GROUP_LABELS,
  type MuscleGroup,
} from "@/schemas/onboarding.schema";

interface ProfileMuscleGroupsSectionProps {
  selectedGroups: MuscleGroup[];
  onToggleGroup: (group: MuscleGroup) => void;
  error?: string;
}

const ALL_MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];

export function ProfileMuscleGroupsSection({
  selectedGroups,
  onToggleGroup,
  error,
}: ProfileMuscleGroupsSectionProps) {
  return (
    <View className="flex-col gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
          Priorytetowe Partie Mięśniowe ({selectedGroups.length})
        </Text>
        <Text className="text-[11px] text-[#71717A]">Wybierz min. 1</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {ALL_MUSCLE_GROUPS.map((group) => {
          const info = MUSCLE_GROUP_LABELS[group];
          const isSelected = selectedGroups.includes(group);

          return (
            <Pressable
              key={group}
              onPress={() => onToggleGroup(group)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              className={`flex-row items-center gap-2 rounded-xl px-3.5 py-2.5 border min-w-[48%] flex-1 transition-colors ${
                isSelected
                  ? "bg-[#007AFF]/15 border-[#007AFF]"
                  : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
              }`}
            >
              <Text className="text-lg">{info.emoji}</Text>
              <Text
                className={`text-xs font-bold flex-1 ${
                  isSelected ? "text-[#007AFF]" : "text-[#D4D4D8]"
                }`}
                numberOfLines={1}
              >
                {info.label}
              </Text>
              {isSelected && (
                <View className="w-4 h-4 rounded-full bg-[#007AFF] items-center justify-center">
                  <Text className="text-[9px] font-black text-white">✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text className="text-xs font-medium text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}
