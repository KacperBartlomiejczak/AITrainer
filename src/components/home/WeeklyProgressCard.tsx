import * as React from "react";
import { View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WeeklyDayProgress } from "@/schemas/home.schema";
import { cn } from "@/lib/utils";

interface WeeklyProgressCardProps {
  completedCount: number;
  targetCount: number;
  days: WeeklyDayProgress[];
}

export function WeeklyProgressCard({
  completedCount,
  targetCount,
  days,
}: WeeklyProgressCardProps) {
  const percentage = Math.round((completedCount / targetCount) * 100);

  return (
    <Card className="border border-[#27272A] bg-[#121214] rounded-2xl p-4">
      <CardContent className="flex-col gap-3 p-0">
        <View className="flex-row items-center justify-between">
          <View className="flex-col gap-0.5">
            <Text className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
              Cel Tygodniowy
            </Text>
            <Text className="text-base font-extrabold text-white">
              {completedCount} z {targetCount} treningów ukończone
            </Text>
          </View>
          <Text className="text-sm font-black text-[#007AFF]">{percentage}%</Text>
        </View>

        {/* Progress Bar */}
        <Progress
          value={percentage}
          indicatorClassName={percentage >= 100 ? "bg-[#22C55E]" : "bg-[#007AFF]"}
          className="h-2 bg-[#27272A]"
        />

        {/* 7 Days of the week indicators */}
        <View className="flex-row items-center justify-between pt-1">
          {days.map((day) => {
            const isCompleted = day.status === "completed";
            const isToday = day.isToday;

            return (
              <View key={day.dayLabel} className="items-center gap-1.5 flex-1">
                <Text
                  className={cn(
                    "text-[11px] font-bold",
                    isToday ? "text-[#007AFF]" : "text-[#71717A]"
                  )}
                >
                  {day.dayLabel}
                </Text>

                <View
                  className={cn(
                    "h-8 w-8 rounded-full items-center justify-center border",
                    isCompleted && "bg-[#22C55E]/20 border-[#22C55E]/40",
                    !isCompleted && isToday && "bg-[#007AFF]/20 border-[#007AFF]",
                    !isCompleted && !isToday && "bg-[#1E1E22] border-[#27272A]"
                  )}
                >
                  {isCompleted ? (
                    <Text className="text-xs font-black text-[#22C55E]">✓</Text>
                  ) : isToday ? (
                    <Text className="text-xs font-black text-[#007AFF]">•</Text>
                  ) : (
                    <Text className="text-[11px] font-medium text-[#71717A]">
                      {day.dateNumber}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}
