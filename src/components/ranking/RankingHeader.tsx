import React from "react";
import { View, Text, Pressable } from "react-native";
import { Info } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StrengthLeague } from "@/schemas/user-profile-screen.schema";
import type { RankingActiveView } from "@/hooks/use-ranking-screen";

interface RankingHeaderProps {
  overallLeague: StrengthLeague;
  totalScore: number;
  activeView: RankingActiveView;
  onViewChange: (view: RankingActiveView) => void;
  onOpenStandards: () => void;
}

export function RankingHeader({
  overallLeague,
  totalScore,
  activeView,
  onViewChange,
  onOpenStandards,
}: RankingHeaderProps) {
  return (
    <View className="flex-col gap-4">
      {/* Segmented View Switcher - Top Level */}
      <View className="flex-row items-center justify-between p-1.5 bg-[#121214] border border-[#27272A] rounded-2xl">
        <Pressable
          testID="view-tab-chart"
          onPress={() => onViewChange("chart")}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Widok wykresu sylwetki ciała"
          accessibilityState={{ selected: activeView === "chart" }}
          className={cn(
            "flex-1 py-2.5 rounded-xl items-center justify-center active:opacity-90",
            activeView === "chart"
              ? "bg-[#007AFF] shadow-md shadow-[#007AFF]/30"
              : "bg-transparent"
          )}
        >
          <Text
            className={cn(
              "text-xs font-black tracking-tight",
              activeView === "chart" ? "text-white" : "text-[#71717A]"
            )}
          >
            🧍 Wykres Ciała
          </Text>
        </Pressable>

        <Pressable
          testID="view-tab-leaderboard"
          onPress={() => onViewChange("leaderboard")}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Widok tabeli rankingu"
          accessibilityState={{ selected: activeView === "leaderboard" }}
          className={cn(
            "flex-1 py-2.5 rounded-xl items-center justify-center active:opacity-90",
            activeView === "leaderboard"
              ? "bg-[#007AFF] shadow-md shadow-[#007AFF]/30"
              : "bg-transparent"
          )}
        >
          <Text
            className={cn(
              "text-xs font-black tracking-tight",
              activeView === "leaderboard" ? "text-white" : "text-[#71717A]"
            )}
          >
            🏆 Tabela Ligi
          </Text>
        </Pressable>

        <Pressable
          testID="view-tab-standards"
          onPress={() => onViewChange("standards")}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Widok standardów siłowych"
          accessibilityState={{ selected: activeView === "standards" }}
          className={cn(
            "flex-1 py-2.5 rounded-xl items-center justify-center active:opacity-90",
            activeView === "standards"
              ? "bg-[#007AFF] shadow-md shadow-[#007AFF]/30"
              : "bg-transparent"
          )}
        >
          <Text
            className={cn(
              "text-xs font-black tracking-tight",
              activeView === "standards" ? "text-white" : "text-[#71717A]"
            )}
          >
            📜 Standardy
          </Text>
        </Pressable>
      </View>

      {/* User Overall Strength Card */}
      <View className="rounded-3xl bg-[#121214] border border-[#27272A] p-5 flex-col gap-3 shadow-xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-col gap-1">
            <Text className="text-xs uppercase font-bold tracking-wider text-[#71717A]">
              Twoja Ogólna Ranga Siłowa
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">{overallLeague.icon}</Text>
              <Text
                className="text-xl font-black tracking-tight"
                style={{ color: overallLeague.badgeColor }}
              >
                {overallLeague.name}
              </Text>
            </View>
          </View>

          <Pressable
            testID="btn-open-standards"
            onPress={onOpenStandards}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Informacje o ligach i zasadach"
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E1E22] border border-[#27272A] active:bg-[#27272A]"
          >
            <Info size={14} color="#A1A1AA" />
            <Text className="text-xs font-semibold text-[#E4E4E7]">Zasady</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between pt-2 border-t border-[#27272A]/80">
          <Text className="text-xs text-[#A1A1AA]">
            {overallLeague.description}
          </Text>
          <Badge
            variant="outline"
            className="bg-[#27272A]/60 border-[#3F3F46] px-2.5 py-0.5"
          >
            <Text className="text-xs font-black text-white">
              ⚡ {totalScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} pkt
            </Text>
          </Badge>
        </View>
      </View>
    </View>
  );

}
