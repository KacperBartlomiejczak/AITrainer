import React from "react";
import { Pressable, Text, View } from "react-native";
import { ArrowLeft, Trash2 } from "lucide-react-native";

interface LiveWorkoutHeaderProps {
  onBack: () => void;
  onDiscard: () => void;
  onFinish: () => void;
}

export function LiveWorkoutHeader({ onBack, onDiscard, onFinish }: LiveWorkoutHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-3 border-b border-[#27272A]">
      <View className="flex-row items-center gap-3">
        <Pressable
          testID="live-workout-back"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Wróć do treningów (trening będzie trwał dalej)"
          className="w-10 h-10 rounded-full bg-[#121214] border border-[#27272A] items-center justify-center active:bg-[#1E1E22]"
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>
        <Text className="text-lg font-black text-white tracking-tight">Pusty trening</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable
          testID="live-workout-discard"
          onPress={onDiscard}
          accessibilityRole="button"
          accessibilityLabel="Odrzuć trening"
          className="w-10 h-10 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 items-center justify-center active:bg-[#EF4444]/20"
        >
          <Trash2 size={16} color="#EF4444" />
        </Pressable>
        <Pressable
          testID="live-workout-finish"
          onPress={onFinish}
          accessibilityRole="button"
          accessibilityLabel="Zakończ trening"
          className="px-4 py-2.5 rounded-full bg-[#2E7D32] active:bg-[#1B5E20]"
        >
          <Text className="text-sm font-bold text-white">Zakończ</Text>
        </Pressable>
      </View>
    </View>
  );
}
