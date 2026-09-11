import * as React from "react";
import { View, Text } from "react-native";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/schemas/user.schema";

interface HomeHeaderProps {
  user: UserProfile;
}

export function HomeHeader({ user }: HomeHeaderProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="flex-row items-center justify-between pb-4 pt-2">
      <View className="flex-col gap-1">
        <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
          Twoja Przestrzeń Treningowa
        </Text>
        <Text className="text-2xl font-black tracking-tight text-white">
          Cześć, {user.name}! 👋
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        {user.streakDays > 0 && (
          <Badge
            variant="warmup"
            size="lg"
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
          >
            <Text className="text-xs font-extrabold text-[#F59E0B]">
              🔥 {user.streakDays} dni
            </Text>
          </Badge>
        )}

        <Avatar className="h-11 w-11 border-2 border-[#27272A]">
          <AvatarFallback textClassName="font-extrabold text-sm text-[#007AFF]">
            {initials || "AI"}
          </AvatarFallback>
        </Avatar>
      </View>
    </View>
  );
}
