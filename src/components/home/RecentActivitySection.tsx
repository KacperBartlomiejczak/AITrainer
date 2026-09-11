import * as React from "react";
import { View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecentActivity } from "@/schemas/workout.schema";

interface RecentActivitySectionProps {
  activity: RecentActivity | null;
}

export function RecentActivitySection({ activity }: RecentActivitySectionProps) {
  if (!activity) return null;

  return (
    <View className="flex-col gap-2.5">
      <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
        Ostatnia Aktywność
      </Text>

      <Card className="border border-[#27272A] bg-[#121214] rounded-2xl p-4">
        <CardContent className="flex-col gap-3 p-0">
          <View className="flex-row items-center justify-between">
            <View className="flex-col gap-0.5">
              <Text className="text-base font-extrabold text-white">
                {activity.title}
              </Text>
              <Text className="text-xs text-[#71717A]">{activity.completedAt}</Text>
            </View>

            {activity.personalRecordsCount > 0 && (
              <Badge variant="pr" className="bg-[#22C55E]/15 border-[#22C55E]/30 px-2.5 py-1">
                <Text className="text-[11px] font-black text-[#22C55E]">
                  🏆 {activity.personalRecordsCount} PR
                </Text>
              </Badge>
            )}
          </View>

          <View className="flex-row items-center justify-between rounded-xl bg-[#18181B] border border-[#27272A] p-2.5 px-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm">⏱️</Text>
              <Text className="text-xs font-bold text-white">
                {activity.durationMinutes} min
              </Text>
            </View>

            <View className="h-3 w-[1px] bg-[#27272A]" />

            <View className="flex-row items-center gap-2">
              <Text className="text-sm">📈</Text>
              <Text className="text-xs font-bold text-white">
                {activity.totalVolumeKg.toLocaleString("pl-PL")} kg objętości
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
