import React from "react";
import { View, Text, Pressable } from "react-native";
import { ArrowLeft, Clock, Dumbbell } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { ROUTINE_LEVEL_LABELS } from "@/schemas/routine.schema";
import type { WorkoutDetail } from "@/schemas/workout-session.schema";

interface WorkoutDetailHeaderProps {
  routine: WorkoutDetail;
  onBack: () => void;
}

export function WorkoutDetailHeader({
  routine,
  onBack,
}: WorkoutDetailHeaderProps) {
  const levelInfo = ROUTINE_LEVEL_LABELS[routine.level];

  return (
    <View className="px-4 pb-4 border-b border-[#27272A] gap-3">
      <View className="flex-row items-center justify-between">
        <Pressable
          testID="workout-back-button"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Wróć do treningów"
          className="w-10 h-10 rounded-full bg-[#121214] border border-[#27272A] items-center justify-center active:bg-[#1E1E22]"
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>
        <Badge
          variant="outline"
          size="sm"
          className="bg-[#1E1E22] border-[#27272A]"
        >
          <Text className="text-xs font-semibold text-[#A1A1AA]">
            {levelInfo.label}
          </Text>
        </Badge>
      </View>

      <View className="gap-1.5">
        <Text className="text-xl font-black text-white tracking-tight">
          {routine.title}
        </Text>
        <Text className="text-xs text-[#A1A1AA] leading-relaxed">
          {routine.description}
        </Text>
      </View>

      <View className="flex-row items-center gap-4 pt-1">
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color="#71717A" />
          <Text className="text-xs text-[#71717A]">
            {routine.durationMinutes} min
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Dumbbell size={14} color="#71717A" />
          <Text className="text-xs text-[#71717A]">
            {routine.exercises.length} ćwiczeń
          </Text>
        </View>
      </View>
    </View>
  );
}
