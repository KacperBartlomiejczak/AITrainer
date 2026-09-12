import React from "react";
import { View, Text } from "react-native";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ProfileStats } from "@/schemas/user-profile-screen.schema";

interface ProfileHeaderWithBadgesProps {
  stats: ProfileStats;
}

export function ProfileHeaderWithBadges({
  stats,
}: ProfileHeaderWithBadgesProps) {
  const initials = stats.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="rounded-3xl bg-[#121214] border border-[#27272A] p-5 flex-col gap-4 shadow-xl">
      <View className="flex-row items-center gap-4">
        <Avatar className="w-20 h-20 rounded-full border-2 border-[#818CF8] shadow-lg shadow-[#818CF8]/20">
          <AvatarFallback className="bg-[#1E1E22]">
            <Text className="text-2xl font-black text-white">{initials}</Text>
          </AvatarFallback>
        </Avatar>

        <View className="flex-1 flex-col gap-1">
          <Text className="text-xl font-black text-white tracking-tight">
            {stats.displayName}
          </Text>
          <Text className="text-xs text-[#71717A]">
            Zawodnik AI Trainer • {stats.totalWorkoutsCompleted} ukończonych treningów
          </Text>
        </View>
      </View>

      {/* Badges / Tags */}
      <View className="flex-row flex-wrap items-center gap-2 pt-1 border-t border-[#27272A]/80">
        <Badge
          variant="outline"
          size="sm"
          className="bg-[#F59E0B]/15 border-[#F59E0B]/35 px-2.5 py-1"
        >
          <Text className="text-xs font-bold text-[#F59E0B]">
            🔥 {stats.streakDays} dni serii
          </Text>
        </Badge>

        <Badge
          variant="outline"
          size="sm"
          className="bg-[#818CF8]/15 border-[#818CF8]/35 px-2.5 py-1"
        >
          <Text className="text-xs font-bold text-[#818CF8]">
            {stats.strengthLeague.icon} {stats.strengthLeague.name}
          </Text>
        </Badge>

        <Badge
          variant="outline"
          size="sm"
          className="bg-[#38BDF8]/15 border-[#38BDF8]/35 px-2.5 py-1"
        >
          <Text className="text-xs font-bold text-[#38BDF8]">
            {stats.benchPressMaxKg} kg Wyciskanie
          </Text>
        </Badge>

        <Badge
          variant="default"
          size="sm"
          className="bg-[#27272A] border-[#3F3F46] px-2.5 py-1"
        >
          <Text className="text-xs font-medium text-[#E4E4E7]">
            {stats.fitnessGoalLabel}
          </Text>
        </Badge>
      </View>
    </View>
  );
}
