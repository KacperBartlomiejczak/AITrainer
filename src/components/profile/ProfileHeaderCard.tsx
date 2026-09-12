import * as React from "react";
import { View, Text } from "react-native";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderCardProps {
  name: string;
  streakDays?: number;
  level?: string;
}

export function ProfileHeaderCard({
  name,
  streakDays = 0,
  level = "Poziom początkujący",
}: ProfileHeaderCardProps) {
  const initials = (name.trim() || "AI")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="flex-row items-center gap-4 p-4 rounded-2xl bg-[#121214] border border-[#27272A]">
      <Avatar className="h-16 w-16 border-2 border-[#007AFF]">
        <AvatarFallback textClassName="font-black text-xl text-[#007AFF]">
          {initials || "AI"}
        </AvatarFallback>
      </Avatar>

      <View className="flex-1 flex-col gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-black text-white" numberOfLines={1}>
            {name || "Twój Profil"}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            size="sm"
            className="bg-[#27272A] border-[#3F3F46]"
          >
            <Text className="text-[11px] font-semibold text-[#D4D4D8]">{level}</Text>
          </Badge>

          {streakDays > 0 && (
            <Badge
              variant="warmup"
              size="sm"
              className="bg-[#F59E0B]/15 border-[#F59E0B]/30"
            >
              <Text className="text-[11px] font-bold text-[#F59E0B]">
                🔥 {streakDays} dni w serii
              </Text>
            </Badge>
          )}
        </View>
      </View>
    </View>
  );
}
