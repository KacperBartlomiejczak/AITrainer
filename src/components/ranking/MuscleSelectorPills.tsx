import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import type { MuscleGroup } from "@/schemas/onboarding.schema";
import type { MuscleRankItem } from "@/schemas/ranking.schema";

interface MuscleSelectorPillsProps {
  ranks: MuscleRankItem[];
  selectedMuscle: MuscleGroup;
  onSelectMuscle: (muscle: MuscleGroup) => void;
}

export function MuscleSelectorPills({
  ranks,
  selectedMuscle,
  onSelectMuscle,
}: MuscleSelectorPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
      className="py-1"
    >
      {ranks.map((rank) => {
        const isSelected = selectedMuscle === rank.muscle;
        return (
          <Pressable
            key={rank.muscle}
            testID={`muscle-pill-${rank.muscle}`}
            onPress={() => onSelectMuscle(rank.muscle)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${rank.namePl}, ranga: ${rank.league.name}`}
            className={cn(
              "flex-row items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all active:scale-95",
              isSelected
                ? "bg-[#1E1E22] border-[#007AFF] shadow-lg shadow-[#007AFF]/20"
                : "bg-[#121214] border-[#27272A]"
            )}
          >
            <Text className="text-base">{rank.emoji}</Text>
            <View className="flex-col">
              <Text
                className={cn(
                  "text-xs font-bold",
                  isSelected ? "text-white" : "text-[#A1A1AA]"
                )}
              >
                Partia: {rank.namePl}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: rank.league.badgeColor }}
                />
                <Text
                  className="text-[10px] font-medium"
                  style={{ color: rank.league.badgeColor }}
                >
                  {rank.currentKg} kg
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
