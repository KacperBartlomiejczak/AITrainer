import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import {
  MUSCLE_BENCHMARK_CONFIGS,
  type RankingMuscleGroup,
} from "@/schemas/ranking.schema";
import { MuscleStandardCard } from "./MuscleStandardCard";

const MUSCLE_KEYS: RankingMuscleGroup[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "biceps",
  "triceps",
  "abs",
];

const FILTER_ITEMS: { id: "all" | RankingMuscleGroup; label: string }[] = [
  { id: "all", label: "Wszystkie (7) 🌐" },
  { id: "chest", label: "Klatka 🫁" },
  { id: "back", label: "Plecy 🔙" },
  { id: "legs", label: "Nogi 🦵" },
  { id: "shoulders", label: "Barki 🤸" },
  { id: "biceps", label: "Biceps 💪" },
  { id: "triceps", label: "Triceps 🦾" },
  { id: "abs", label: "Brzuch 🎯" },
];

export function RankingStandardsView() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | RankingMuscleGroup>("all");

  const visibleConfigs =
    selectedFilter === "all"
      ? MUSCLE_KEYS.map((k) => MUSCLE_BENCHMARK_CONFIGS[k])
      : [MUSCLE_BENCHMARK_CONFIGS[selectedFilter]];

  return (
    <View testID="ranking-standards-view" className="flex-col gap-4">
      {/* Informative Header Banner */}
      <View className="p-4 rounded-3xl bg-[#121214] border border-[#27272A] flex-col gap-1.5 shadow-md">
        <Text className="text-sm font-black text-white">
          📜 Oficjalne Standardy Siłowe AI Trainer
        </Text>
        <Text className="text-xs text-[#A1A1AA] leading-relaxed">
          Sprawdź wymagane obciążenie 1RM w kluczowych ćwiczeniach bazowych dla każdej ligi.
          Np. 100 kg na klatę = Diamentowa Liga! 💎
        </Text>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6 }}
        className="py-1"
      >
        {FILTER_ITEMS.map((item) => {
          const isSelected = selectedFilter === item.id;
          return (
            <Pressable
              key={item.id}
              testID={`standards-filter-${item.id}`}
              onPress={() => setSelectedFilter(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filtruj standardy: ${item.label}`}
              className={`px-3 py-1.5 rounded-full border ${
                isSelected
                  ? "bg-[#007AFF] border-[#007AFF]"
                  : "bg-[#121214] border-[#27272A]"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isSelected ? "text-white" : "text-[#A1A1AA]"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Muscle Standards List */}
      <View className="flex-col gap-3">
        {visibleConfigs.map((config) => (
          <MuscleStandardCard key={config.muscle} config={config} />
        ))}
      </View>
    </View>
  );
}
