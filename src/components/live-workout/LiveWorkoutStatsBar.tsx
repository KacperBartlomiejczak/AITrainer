import React from "react";
import { Text, View } from "react-native";
import { formatElapsed, formatKg } from "@/lib/live-workout-stats";

interface LiveWorkoutStatsBarProps {
  elapsedSeconds: number;
  completedSetCount: number;
  totalVolumeKg: number;
}

interface StatTileProps {
  label: string;
  testID: string;
  value: string | number;
}

function StatTile({ label, testID, value }: StatTileProps) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-[#121214] border border-[#27272A] py-3 gap-0.5">
      <Text testID={testID} className="text-lg font-black text-white" style={{ fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">{label}</Text>
    </View>
  );
}

/** Timer, number of completed sets and workout volume. */
export function LiveWorkoutStatsBar({ elapsedSeconds, completedSetCount, totalVolumeKg }: LiveWorkoutStatsBarProps) {
  return (
    <View className="flex-row gap-2" accessibilityRole="summary">
      <StatTile label="Czas" testID="live-workout-timer" value={formatElapsed(elapsedSeconds)} />
      <StatTile label="Serie" testID="live-workout-set-count" value={completedSetCount} />
      <StatTile label="Tonaż" testID="live-workout-volume" value={formatKg(totalVolumeKg)} />
    </View>
  );
}
