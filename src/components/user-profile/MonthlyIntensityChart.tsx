import React from "react";
import { View, Text } from "react-native";
import type { MonthlyIntensity } from "@/schemas/user-profile-screen.schema";

interface MonthlyIntensityChartProps {
  intensity: MonthlyIntensity;
}

export function MonthlyIntensityChart({
  intensity,
}: MonthlyIntensityChartProps) {
  return (
    <View className="rounded-3xl bg-[#121214] border border-[#27272A] p-5 flex-col gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-col gap-0.5">
          <Text className="text-base font-black text-white">
            Intensywność Treningów
          </Text>
          <Text className="text-xs text-[#71717A]">
            Rozbicie tygodniowe • {intensity.monthLabel}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-xl font-black text-[#38BDF8]">
            {intensity.totalHours.toFixed(1)}h
          </Text>
          <Text className="text-[10px] text-[#71717A] uppercase font-bold">
            Suma w miesiącu
          </Text>
        </View>
      </View>

      <View className="flex-col gap-3">
        {intensity.weeks.map((week) => {
          const ratio = Math.min(1, week.hours / week.targetHours);
          const percent = Math.round(ratio * 100);

          return (
            <View
              key={week.id}
              className={`p-3 rounded-2xl border ${
                week.isCurrentWeek
                  ? "bg-[#1E1E22] border-[#38BDF8]/40"
                  : "bg-[#18181B]/60 border-[#27272A]"
              } flex-col gap-2`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-bold text-white">
                    {week.weekLabel}
                  </Text>
                  {week.isCurrentWeek && (
                    <View className="bg-[#38BDF8]/20 px-1.5 py-0.5 rounded-full">
                      <Text className="text-[9px] font-extrabold text-[#38BDF8]">
                        TERAZ
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs font-extrabold text-[#38BDF8]">
                  {week.hours.toFixed(1)}h
                </Text>
              </View>

              {/* Progress bar */}
              <View className="h-2 w-full bg-[#27272A] rounded-full overflow-hidden">
                <View
                  className="h-full bg-gradient-to-r from-[#007AFF] to-[#38BDF8] rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
