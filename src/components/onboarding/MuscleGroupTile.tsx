import React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";
import { MUSCLE_GROUP_LABELS, type MuscleGroup } from "@/schemas/onboarding.schema";

interface MuscleGroupTileProps {
  group: MuscleGroup;
  isSelected: boolean;
  onPress: (group: MuscleGroup) => void;
}

export function MuscleGroupTile({ group, isSelected, onPress }: MuscleGroupTileProps) {
  const { label, emoji } = MUSCLE_GROUP_LABELS[group];

  return (
    <Pressable
      testID={`muscle-group-${group}`}
      onPress={() => onPress(group)}
      className={cn(
        "w-[48%] rounded-2xl p-4 mb-3 border items-center",
        isSelected
          ? "bg-[rgba(0,122,255,0.15)] border-[#007AFF]"
          : "bg-[#121214] border-[#27272A]"
      )}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
    >
      <View
        className={cn(
          "w-14 h-14 rounded-2xl items-center justify-center mb-3",
          isSelected ? "bg-[#007AFF]" : "bg-[#1E1E22]"
        )}
      >
        <Text className="text-3xl">{emoji}</Text>
      </View>
      <Text
        className={cn(
          "text-sm font-bold text-center",
          isSelected ? "text-[#007AFF]" : "text-white"
        )}
      >
        {label}
      </Text>
      {isSelected && (
        <View className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#007AFF] items-center justify-center">
          <Text className="text-white text-[10px] font-bold">✓</Text>
        </View>
      )}
    </Pressable>
  );
}
