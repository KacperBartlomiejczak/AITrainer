import * as React from "react";
import { View, Text, Pressable } from "react-native";
import {
  FITNESS_GOAL_LABELS,
  type FitnessGoal,
} from "@/schemas/onboarding.schema";

interface ProfileGoalSectionProps {
  selectedGoal: FitnessGoal | null;
  onSelectGoal: (goal: FitnessGoal) => void;
  error?: string;
}

const ALL_GOALS = Object.keys(FITNESS_GOAL_LABELS) as FitnessGoal[];

export function ProfileGoalSection({
  selectedGoal,
  onSelectGoal,
  error,
}: ProfileGoalSectionProps) {
  return (
    <View className="flex-col gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
          Główny Cel Treningowy (Splash)
        </Text>
      </View>

      <View className="flex-col gap-2">
        {ALL_GOALS.map((goal) => {
          const info = FITNESS_GOAL_LABELS[goal];
          const isSelected = selectedGoal === goal;

          return (
            <Pressable
              key={goal}
              onPress={() => onSelectGoal(goal)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              className={`flex-row items-center justify-between rounded-xl p-3 border transition-colors ${
                isSelected
                  ? "bg-[#007AFF]/15 border-[#007AFF]"
                  : "bg-[#121214] border-[#27272A] active:bg-[#1E1E22]"
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  className={`w-10 h-10 rounded-lg items-center justify-center ${
                    isSelected ? "bg-[#007AFF]" : "bg-[#1E1E22]"
                  }`}
                >
                  <Text className="text-xl">{info.emoji}</Text>
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? "text-[#007AFF]" : "text-white"
                    }`}
                  >
                    {info.label}
                  </Text>
                  <Text className="text-[11px] text-[#A1A1AA]" numberOfLines={1}>
                    {info.description}
                  </Text>
                </View>
              </View>

              {isSelected && (
                <View className="w-5 h-5 rounded-full bg-[#007AFF] items-center justify-center ml-2">
                  <Text className="text-[10px] font-black text-white">✓</Text>
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
