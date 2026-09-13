import React from "react";
import { View, Text } from "react-native";
import { Badge } from "@/components/ui/badge";
import { STRENGTH_LEAGUES, type StrengthLeagueId } from "@/schemas/user-profile-screen.schema";
import type { MuscleBenchmarkConfig } from "@/schemas/ranking.schema";

interface MuscleStandardCardProps {
  config: MuscleBenchmarkConfig;
}

const ORDERED_LEAGUES: StrengthLeagueId[] = [
  "titan",
  "master",
  "diamond",
  "platinum",
  "gold",
  "silver",
  "bronze",
];

export function MuscleStandardCard({ config }: MuscleStandardCardProps) {
  return (
    <View
      testID={`standard-card-${config.muscle}`}
      className="p-4 rounded-3xl bg-[#121214] border border-[#27272A] flex-col gap-3 shadow-lg"
    >
      {/* Card Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <Text className="text-2xl">{config.emoji}</Text>
          <View className="flex-col">
            <Text className="text-base font-black text-white">{config.namePl}</Text>
            <Text className="text-xs text-[#A1A1AA] font-medium">{config.exerciseName}</Text>
          </View>
        </View>

        <Badge variant="outline" className="bg-[#1E1E22] border-[#3F3F46] px-2 py-0.5">
          <Text className="text-[10px] font-bold text-[#D4D4D8]">
            {config.viewSide === "front" ? "Przód" : "Tył"}
          </Text>
        </Badge>
      </View>

      {/* League Thresholds List */}
      <View className="flex-col gap-1.5 pt-2 border-t border-[#27272A]">
        {ORDERED_LEAGUES.map((leagueId) => {
          const league = STRENGTH_LEAGUES[leagueId];
          const minKg = config.thresholds[leagueId];
          const isDiamond = leagueId === "diamond";

          return (
            <View
              key={leagueId}
              className={`flex-row items-center justify-between px-3 py-1.5 rounded-xl border ${
                isDiamond
                  ? "bg-[#007AFF]/15 border-[#007AFF]/40"
                  : "bg-[#18181B] border-[#27272A]/50"
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-sm">{league.icon}</Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: isDiamond ? "#60A5FA" : league.badgeColor }}
                >
                  {league.name}
                </Text>
              </View>

              <Text
                className={`text-xs font-black ${
                  isDiamond ? "text-[#60A5FA]" : "text-white"
                }`}
              >
                ≥ {minKg} kg
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
