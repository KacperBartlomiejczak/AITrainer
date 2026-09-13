import React from "react";
import { View, Text, Pressable } from "react-native";
import { Play, CheckCircle2 } from "lucide-react-native";

interface WorkoutStartButtonProps {
  isActive: boolean;
  onStart: () => void;
  onFinish: () => void;
}

export function WorkoutStartButton({
  isActive,
  onStart,
  onFinish,
}: WorkoutStartButtonProps) {
  if (isActive) {
    return (
      <View className="pt-2">
        <Pressable
          testID="finish-workout-button"
          onPress={onFinish}
          accessibilityRole="button"
          accessibilityLabel="Zakończ trening"
          className="flex-row items-center justify-center gap-2 bg-[#2E7D32] py-3.5 px-6 rounded-2xl active:bg-[#1B5E20]"
        >
          <CheckCircle2 size={20} color="#FFFFFF" />
          <Text className="text-white font-bold text-base">Zakończ trening</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="pt-2">
      <Pressable
        testID="start-workout-session-button"
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel="Rozpocznij ten trening"
        className="flex-row items-center justify-center gap-2 bg-[#007AFF] py-3.5 px-6 rounded-2xl active:bg-[#0062CC]"
      >
        <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
        <Text className="text-white font-bold text-base">
          Rozpocznij ten trening
        </Text>
      </Pressable>
    </View>
  );
}
