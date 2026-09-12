import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Play } from "lucide-react-native";
import type { UserRoutineCard } from "@/schemas/user-profile-screen.schema";

interface UserRoutinesListProps {
  routines: UserRoutineCard[];
  onStartRoutine: (routineId: string) => void;
}

export function UserRoutinesList({
  routines,
  onStartRoutine,
}: UserRoutinesListProps) {
  return (
    <View className="flex-col gap-3">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">
          📋 Twoje Plany Treningowe
        </Text>
        <Text className="text-xs text-[#71717A]">Przewiń plany →</Text>
      </View>

      <ScrollView
        testID="routines-horizontal-scroll"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
      >
        {routines.map((routine) => (
          <View
            key={routine.id}
            className="w-64 rounded-2xl bg-[#121214] border border-[#27272A] p-4 flex-col justify-between gap-3 shadow-lg"
          >
            <View className="flex-col gap-2">
              <View className="flex-row items-center justify-between">
                <View className="bg-[#1E1E22] px-2 py-0.5 rounded-full border border-[#27272A]">
                  <Text className="text-[10px] text-[#38BDF8] font-bold">
                    {routine.levelLabel}
                  </Text>
                </View>
                <Text className="text-[11px] text-[#71717A] font-semibold">
                  {routine.exerciseCount} ćwiczeń
                </Text>
              </View>

              <Text
                className="text-base font-black text-white leading-5"
                numberOfLines={2}
              >
                {routine.title}
              </Text>

              <Text className="text-xs text-[#A1A1AA] font-medium">
                {routine.daysPerWeek}x w tyg • {routine.durationMinutes} min
              </Text>

              <View className="flex-row flex-wrap gap-1 pt-1">
                {routine.targetMuscleGroups.map((group) => (
                  <View
                    key={group}
                    className="bg-[#18181B] px-2 py-0.5 rounded-md border border-[#27272A]"
                  >
                    <Text className="text-[10px] text-[#A1A1AA] font-semibold">
                      {group}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              testID={`start-routine-${routine.id}`}
              onPress={() => onStartRoutine(routine.id)}
              className="flex-row items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#007AFF] active:bg-[#0060DF]"
              accessibilityRole="button"
              accessibilityLabel={`Rozpocznij ${routine.title}`}
            >
              <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-xs font-black text-white">Rozpocznij</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
