import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaderboardUser } from "@/schemas/ranking.schema";
import type { StrengthLeagueId } from "@/schemas/user-profile-screen.schema";

interface RankingLeaderboardProps {
  users: LeaderboardUser[];
  selectedFilter: "all" | StrengthLeagueId;
  onSelectFilter: (filter: "all" | StrengthLeagueId) => void;
}

const FILTER_OPTIONS: { id: "all" | StrengthLeagueId; label: string }[] = [
  { id: "all", label: "Wszyscy 🌍" },
  { id: "titan", label: "Tytan ⚡" },
  { id: "diamond", label: "Diament 💎" },
  { id: "master", label: "Mistrz 👑" },
  { id: "platinum", label: "Platyna 🛡️" },
  { id: "gold", label: "Złoto 🥇" },
  { id: "silver", label: "Srebro 🥈" },
  { id: "bronze", label: "Brąz 🥉" },
];

export function RankingLeaderboard({
  users,
  selectedFilter,
  onSelectFilter,
}: RankingLeaderboardProps) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Text className="text-lg">🥇</Text>;
      case 2:
        return <Text className="text-lg">🥈</Text>;
      case 3:
        return <Text className="text-lg">🥉</Text>;
      default:
        return (
          <Text className="text-xs font-black text-[#71717A]">#{rank}</Text>
        );
    }
  };

  return (
    <View testID="ranking-leaderboard-view" className="flex-col gap-4">
      {/* Leaderboard Header Banner */}
      <View className="p-4 rounded-3xl bg-[#121214] border border-[#27272A] flex-col gap-1.5 shadow-md">
        <Text className="text-sm font-black text-white">
          🏆 Oficjalna Tabela Rankingu Społeczności
        </Text>
        <Text className="text-xs text-[#A1A1AA] leading-relaxed">
          Zdobywaj punkty siłowe za ciężary w ćwiczeniach bazowych i walcz o pozycję na podium!
        </Text>
      </View>

      {/* League Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6 }}
        className="py-1"
      >
        {FILTER_OPTIONS.map((f) => {
          const isSelected = selectedFilter === f.id;
          return (
            <Pressable
              key={f.id}
              testID={`leaderboard-filter-${f.id}`}
              onPress={() => onSelectFilter(f.id)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filtruj: ${f.label}`}
              className={cn(
                "px-3 py-1.5 rounded-full border active:opacity-80",
                isSelected
                  ? "bg-[#007AFF] border-[#007AFF]"
                  : "bg-[#121214] border-[#27272A]"
              )}
            >
              <Text
                className={cn(
                  "text-xs font-bold",
                  isSelected ? "text-white" : "text-[#A1A1AA]"
                )}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Users List */}
      <View className="flex-col gap-2.5">
        {users.map((user) => {
          const initials = user.displayName
            .replace("(Ty)", "")
            .trim()
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <View
              key={user.id}
              className={cn(
                "flex-row items-center justify-between p-3.5 rounded-2xl border shadow-md",
                user.isCurrentUser
                  ? "bg-[#1E1E22] border-[#007AFF]/60 shadow-[#007AFF]/15"
                  : "bg-[#121214] border-[#27272A]"
              )}
            >
              {/* Left: Rank + Avatar + Name */}
              <View className="flex-row items-center gap-3">
                <View className="w-7 items-center justify-center">
                  {getRankBadge(user.rank)}
                </View>

                <Avatar
                  className="w-10 h-10 rounded-full border"
                  style={{ borderColor: user.league.badgeColor }}
                >
                  <AvatarFallback className="bg-[#27272A]">
                    <Text className="text-xs font-black text-white">
                      {initials}
                    </Text>
                  </AvatarFallback>
                </Avatar>

                <View className="flex-col">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-sm font-bold text-white">
                      {user.displayName}
                    </Text>
                  </View>
                  <Text className="text-[11px] text-[#71717A]">
                    Najlepsza partia: {user.topMuscleNamePl} ({user.topRecordSummary})
                  </Text>
                </View>
              </View>

              {/* Right: League Badge & Points */}
              <View className="flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  style={{
                    borderColor: `${user.league.badgeColor}50`,
                    backgroundColor: `${user.league.badgeColor}15`,
                  }}
                  className="px-2 py-0.5"
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: user.league.badgeColor }}
                  >
                    {user.league.icon} {user.league.name.replace(" Liga", "")}
                  </Text>
                </Badge>
                <Text className="text-xs font-black text-white">
                  {user.totalScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
                  <Text className="text-[10px] text-[#71717A]">pkt</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

}
