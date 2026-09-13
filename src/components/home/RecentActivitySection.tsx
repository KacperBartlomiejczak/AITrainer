import * as React from "react";
import { View, Text, Image } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import type { RecentActivity } from "@/schemas/workout.schema";

interface RecentActivitySectionProps {
  activity: RecentActivity | null;
}

function SectionTitle() {
  return (
    <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
      Ostatnia Aktywność
    </Text>
  );
}

export function RecentActivitySection({ activity }: RecentActivitySectionProps) {
  if (!activity) {
    return (
      <View className="flex-col gap-2.5">
        <SectionTitle />
        <Card testID="recent-activity-empty" className="border border-dashed border-[#27272A] bg-[#121214] rounded-2xl p-4">
          <CardContent className="flex-col items-center gap-1 p-0">
            <Text className="text-base font-extrabold text-white">Brak treningów</Text>
            <Text className="text-xs text-[#71717A] text-center">
              Ukończ pierwszy trening, a pojawi się tutaj 💪
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <View className="flex-col gap-2.5">
      <SectionTitle />

      <Card className="border border-[#27272A] bg-[#121214] rounded-2xl p-4">
        <CardContent className="flex-row items-center gap-3 p-0">
          {activity.photoUri && (
            <Image
              testID="recent-activity-photo"
              source={{ uri: activity.photoUri }}
              accessibilityLabel={`Zdjęcie z treningu ${activity.title}`}
              className="w-16 h-20 rounded-xl bg-[#18181B]"
              resizeMode="cover"
            />
          )}

          <View className="flex-1 flex-col gap-3">
            <View className="flex-col gap-0.5">
              <Text className="text-base font-extrabold text-white" numberOfLines={1}>
                {activity.title}
              </Text>
              <Text className="text-xs text-[#71717A]">{activity.completedAt}</Text>
            </View>

            <View className="flex-row items-center justify-between rounded-xl bg-[#18181B] border border-[#27272A] p-2.5 px-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm">⏱️</Text>
                <Text className="text-xs font-bold text-white">{activity.durationMinutes} min</Text>
              </View>

              <View className="h-3 w-[1px] bg-[#27272A]" />

              <View className="flex-row items-center gap-2">
                <Text className="text-sm">✅</Text>
                <Text className="text-xs font-bold text-white">
                  {activity.completedExerciseCount}/{activity.totalExerciseCount} ćwiczeń
                </Text>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
