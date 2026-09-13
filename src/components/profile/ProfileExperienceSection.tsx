import * as React from "react";
import { View, Text, Pressable } from "react-native";
import {
  EXPERIENCE_LEVEL_LABELS,
  ExperienceLevelSchema,
  type ExperienceLevel,
} from "@/schemas/onboarding.schema";

interface ProfileExperienceSectionProps {
  selectedLevel: ExperienceLevel | null;
  onSelectLevel: (level: ExperienceLevel) => void;
  error?: string;
}

export function ProfileExperienceSection({
  selectedLevel,
  onSelectLevel,
  error,
}: ProfileExperienceSectionProps) {
  return (
    <View className="flex-col gap-2">
      <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
        Staż Treningowy
      </Text>

      <View className="flex-row gap-2">
        {ExperienceLevelSchema.options.map((level) => {
          const info = EXPERIENCE_LEVEL_LABELS[level];
          const isSelected = selectedLevel === level;

          return (
            <Pressable
              key={level}
              testID={`profile-experience-${level}`}
              onPress={() => onSelectLevel(level)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              className={`flex-1 items-center gap-1 rounded-xl p-3 border ${
                isSelected
                  ? "bg-[#007AFF]/15 border-[#007AFF]"
                  : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
              }`}
            >
              <Text className="text-xl">{info.emoji}</Text>
              <Text
                className={`text-xs font-bold text-center ${
                  isSelected ? "text-[#007AFF]" : "text-white"
                }`}
              >
                {info.label}
              </Text>
              <Text className="text-[10px] text-center text-[#A1A1AA]">{info.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text className="text-xs font-medium text-red-500">{error}</Text> : null}
    </View>
  );
}
