import React from "react";
import { View, Text } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PublicProfileCardProps {
  displayName: string;
  fitnessGoalLabel: string;
  streakDays: number;
}

export function PublicProfileCard({
  displayName,
  fitnessGoalLabel,
  streakDays,
}: PublicProfileCardProps) {
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="rounded-3xl bg-[#121214] border border-[#27272A] p-6 items-center flex-col gap-4 shadow-xl">
      <Avatar className="w-24 h-24 rounded-full border-2 border-[#007AFF] shadow-lg shadow-[#007AFF]/20">
        <AvatarFallback className="bg-[#1E1E22]">
          <Text className="text-3xl font-black text-white">{initials}</Text>
        </AvatarFallback>
      </Avatar>

      <View className="items-center flex-col gap-1">
        <Text className="text-xl font-black text-white tracking-tight text-center">
          {displayName}
        </Text>
        <Text className="text-xs text-[#71717A] text-center">
          Członek społeczności AI Trainer
        </Text>
      </View>

      <View className="flex-row items-center justify-center gap-2 pt-1">
        <Badge variant="default" size="sm" className="bg-[#007AFF]/15 border-[#007AFF]/30 px-3 py-1">
          <Text className="text-xs font-semibold text-[#007AFF]">
            {fitnessGoalLabel}
          </Text>
        </Badge>
        <Badge variant="outline" size="sm" className="bg-[#F59E0B]/10 border-[#F59E0B]/30 px-3 py-1">
          <Text className="text-xs font-semibold text-[#F59E0B]">
            🔥 {streakDays} dni serii
          </Text>
        </Badge>
      </View>
    </View>
  );
}
