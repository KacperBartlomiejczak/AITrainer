import * as React from "react";
import { View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkoutSummary } from "@/schemas/workout.schema";

interface TodayWorkoutCardProps {
  workout: WorkoutSummary | null;
  onStartWorkout?: (workoutId: string) => void;
}

export function TodayWorkoutCard({ workout, onStartWorkout }: TodayWorkoutCardProps) {
  if (!workout) {
    return (
      <Card className="p-5 bg-[#121214] border border-[#27272A] items-center justify-center">
        <Text className="text-sm font-medium text-[#A1A1AA]">
          Brak zaplanowanego treningu na dzisiaj. Dzień na regenerację! 🧘
        </Text>
      </Card>
    );
  }

  return (
    <Card className="border border-[#27272A] bg-[#121214] rounded-2xl overflow-hidden">
      <CardContent className="flex-col gap-4 p-5">
        <View className="flex-row items-center justify-between">
          <Badge variant="default" className="bg-[#007AFF]/15 border-[#007AFF]/30 px-2.5 py-1">
            <Text className="text-[11px] font-extrabold tracking-wider text-[#007AFF]">
              DZISIEJSZY TRENING
            </Text>
          </Badge>
          <Text className="text-xs font-medium text-[#71717A]">
            {workout.difficulty === "easy"
              ? "🟢 Łatwy"
              : workout.difficulty === "moderate"
              ? "🟡 Średni"
              : "🔴 Wymagający"}
          </Text>
        </View>

        <View className="flex-col gap-1">
          <Text className="text-xl font-black tracking-tight text-white">
            {workout.title}
          </Text>
          {workout.subtitle && (
            <Text className="text-xs font-medium text-[#A1A1AA]">
              {workout.subtitle}
            </Text>
          )}
        </View>

        {/* Target muscle groups */}
        <View className="flex-row flex-wrap gap-1.5">
          {workout.targetMuscleGroups.map((muscle) => (
            <Badge
              key={muscle}
              variant="secondary"
              className="bg-[#1E1E22] border-[#27272A] px-2 py-0.5"
            >
              <Text className="text-[11px] font-semibold text-[#A1A1AA]">
                {muscle}
              </Text>
            </Badge>
          ))}
        </View>

        {/* Workout quick stats row */}
        <View className="flex-row items-center justify-between rounded-xl bg-[#18181B] border border-[#27272A] p-3">
          <View className="flex-1 items-center border-r border-[#27272A]">
            <Text className="text-xs text-[#71717A] font-medium">Czas</Text>
            <Text className="text-sm font-bold text-white mt-0.5">
              ⏱️ {workout.estimatedDurationMinutes} min
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xs text-[#71717A] font-medium">Ćwiczenia</Text>
            <Text className="text-sm font-bold text-white mt-0.5">
              🏋️ {workout.exerciseCount} ćwiczeń
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <Button
          variant="default"
          size="lg"
          onPress={() => onStartWorkout?.(workout.id)}
          className="w-full bg-[#007AFF] active:bg-[#0062CC] rounded-xl py-3.5 shadow-lg shadow-[#007AFF]/20"
        >
          <Text className="text-base font-black text-white tracking-wide">
            Rozpocznij Trening 🔥
          </Text>
        </Button>
      </CardContent>
    </Card>
  );
}
