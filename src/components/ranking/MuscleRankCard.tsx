import React from "react";
import { View, Text, Pressable } from "react-native";
import { Plus, Minus } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_BENCHMARK_CONFIGS, type MuscleRankItem, type RankingMuscleGroup } from "@/schemas/ranking.schema";

interface MuscleRankCardProps {
  item: MuscleRankItem;
  onUpdateKg: (muscle: RankingMuscleGroup, deltaOrVal: number, isDelta: boolean) => void;
}

export function MuscleRankCard({ item, onUpdateKg }: MuscleRankCardProps) {
  const config = MUSCLE_BENCHMARK_CONFIGS[item.muscle];

  return (
    <View className="rounded-3xl bg-[#121214] border border-[#27272A] p-5 flex-col gap-4 shadow-xl">
      {/* Header: Name + League Badge */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <Text className="text-2xl">{item.emoji}</Text>
          <View className="flex-col">
            <Text className="text-lg font-black text-white tracking-tight">
              {item.namePl}
            </Text>
            <Text className="text-xs text-[#71717A]">
              {item.benchmarkExercise}
            </Text>
          </View>
        </View>

        <Badge
          variant="outline"
          style={{ borderColor: item.league.badgeColor, backgroundColor: `${item.league.badgeColor}20` }}
          className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
        >
          <Text className="text-xs font-black" style={{ color: item.league.badgeColor }}>
            <Text>{item.league.icon} </Text>
            <Text>{item.league.name}</Text>
          </Text>
        </Badge>
      </View>

      {/* Current Record & Live Simulator */}
      <View className="flex-row items-center justify-between p-3.5 rounded-2xl bg-[#1E1E22] border border-[#27272A]">
        <View className="flex-col">
          <Text className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-semibold">
            Rekord (PR)
          </Text>
          <Text className="text-2xl font-black text-white">
            {item.currentKg} <Text className="text-sm font-semibold text-[#71717A]">kg</Text>
          </Text>
        </View>

        {/* Quick Adjustment Simulator Buttons */}
        <View className="flex-row items-center gap-2">
          <Pressable
            testID="btn-decrease-kg"
            onPress={() => onUpdateKg(item.muscle, -5, true)}
            accessibilityRole="button"
            accessibilityLabel="Zmniejsz ciężar o 5 kg"
            className="w-10 h-10 rounded-xl bg-[#27272A] items-center justify-center active:bg-[#3F3F46]"
          >
            <Minus size={16} color="#FFFFFF" />
          </Pressable>

          <Pressable
            testID="btn-increase-kg"
            onPress={() => onUpdateKg(item.muscle, 5, true)}
            accessibilityRole="button"
            accessibilityLabel="Zwiększ ciężar o 5 kg"
            className="w-10 h-10 rounded-xl bg-[#007AFF] items-center justify-center active:bg-[#0066CC] shadow-md shadow-[#007AFF]/30"
          >
            <Plus size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Next League Progress Bar */}
      <View className="flex-col gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-[#A1A1AA]">
            {item.nextLeague ? (
              <>
                Kolejna ranga: <Text className="font-bold text-white">{item.nextLeague.name} {item.nextLeague.icon}</Text>
              </>
            ) : (
              <Text className="font-bold text-[#F43F5E]">Maksymalna ranga osiągnięta! ⚡</Text>
            )}
          </Text>
          {item.nextLeague && (
            <Text className="text-xs font-bold text-[#818CF8]">
              Brakuje {item.kgRemaining} kg
            </Text>
          )}
        </View>

        <View className="h-2.5 w-full bg-[#1E1E22] rounded-full overflow-hidden border border-[#27272A]">
          <View
            className="h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#818CF8]"
            style={{
              width: `${item.progressPercent}%`,
              backgroundColor: item.league.badgeColor,
            }}
          />
        </View>
      </View>

      {/* League Standards Tiers list for this muscle */}
      <View className="flex-col gap-1 pt-2 border-t border-[#27272A]/80">
        <Text className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
          Progi wagowe dla tej partii:
        </Text>
        <View className="flex-row flex-wrap gap-1.5 pt-1">
          <View className="px-2 py-0.5 rounded-md bg-[#27272A]/60">
            <Text className="text-[10px] text-[#A1A1AA]">🥈 Srebro: {config.thresholds.silver}kg</Text>
          </View>
          <View className="px-2 py-0.5 rounded-md bg-[#27272A]/60">
            <Text className="text-[10px] text-[#A1A1AA]">🥇 Złoto: {config.thresholds.gold}kg</Text>
          </View>
          <View className="px-2 py-0.5 rounded-md bg-[#27272A]/60">
            <Text className="text-[10px] text-[#A1A1AA]">🛡️ Platyna: {config.thresholds.platinum}kg</Text>
          </View>
          <View className="px-2 py-0.5 rounded-md bg-[#818CF8]/20 border border-[#818CF8]/40">
            <Text className="text-[10px] font-bold text-[#818CF8]">💎 Diament: {config.thresholds.diamond}kg</Text>
          </View>
          <View className="px-2 py-0.5 rounded-md bg-[#27272A]/60">
            <Text className="text-[10px] text-[#A1A1AA]">👑 Mistrz: {config.thresholds.master}kg</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
